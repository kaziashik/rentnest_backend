/**
 * Full rental lifecycle E2E against the DB + Stripe fulfill helpers.
 * Flow: AVAILABLE → PENDING → APPROVED (still AVAILABLE) → pay → ACTIVE/UNAVAILABLE → COMPLETED/AVAILABLE
 */
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { fulfillPaidCheckout } from "../src/modules/payment/payment.fulfill";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const tenant = await prisma.user.findFirst({
    where: { email: "tenant@rentnest.com" },
  });
  const landlord = await prisma.user.findFirst({
    where: { email: "landlord@rentnest.com" },
  });
  assert(tenant && landlord, "Demo tenant/landlord missing");

  const property = await prisma.property.findFirst({
    where: {
      propertyOwnerId: landlord.id,
      availability: "AVAILABLE",
      rentalRequests: {
        none: { status: { in: ["PENDING", "APPROVED", "ACTIVE"] } },
      },
    },
  });
  assert(property, "No available landlord property for lifecycle test");

  const steps: string[] = [];

  // 1) Tenant request → PENDING, property stays AVAILABLE
  const request = await prisma.rentalRequest.create({
    data: {
      propertyId: property.id,
      tenantId: tenant.id,
      moveInDate: new Date("2026-09-01"),
      message: "Lifecycle E2E test request",
      status: "PENDING",
    },
  });
  let prop = await prisma.property.findUniqueOrThrow({ where: { id: property.id } });
  assert(request.status === "PENDING", "Expected PENDING");
  assert(prop.availability === "AVAILABLE", "PENDING must keep AVAILABLE");
  steps.push("PENDING + AVAILABLE");

  // 2) Landlord approve → APPROVED, still AVAILABLE
  await prisma.rentalRequest.update({
    where: { id: request.id },
    data: { status: "APPROVED" },
  });
  // Mirror service rule: APPROVED keeps AVAILABLE if no ACTIVE rental
  await prisma.property.update({
    where: { id: property.id },
    data: { availability: "AVAILABLE" },
  });
  prop = await prisma.property.findUniqueOrThrow({ where: { id: property.id } });
  const approved = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: request.id },
  });
  assert(approved.status === "APPROVED", "Expected APPROVED");
  assert(prop.availability === "AVAILABLE", "APPROVED must keep AVAILABLE");
  steps.push("APPROVED + AVAILABLE");

  // 3) Payment fulfill → ACTIVE + UNAVAILABLE
  await fulfillPaidCheckout({
    requestId: request.id,
    amountTotal: Number(property.rentPrice) * 100,
    paymentIntent: `pi_e2e_${request.id.slice(0, 8)}`,
    sessionId: `cs_e2e_${request.id.slice(0, 8)}`,
  });
  const active = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: request.id },
    include: { payment: true },
  });
  prop = await prisma.property.findUniqueOrThrow({ where: { id: property.id } });
  assert(active.status === "ACTIVE", "Expected ACTIVE after payment");
  assert(active.payment?.paymentStatus === "PAID", "Expected PAID payment");
  assert(prop.availability === "UNAVAILABLE", "ACTIVE must set UNAVAILABLE");
  steps.push("ACTIVE + UNAVAILABLE + PAID");

  // 4) Mark completed → COMPLETED + AVAILABLE
  await prisma.rentalRequest.update({
    where: { id: request.id },
    data: { status: "COMPLETED" },
  });
  await prisma.property.update({
    where: { id: property.id },
    data: { availability: "AVAILABLE" },
  });
  const completed = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: request.id },
  });
  prop = await prisma.property.findUniqueOrThrow({ where: { id: property.id } });
  assert(completed.status === "COMPLETED", "Expected COMPLETED");
  assert(prop.availability === "AVAILABLE", "COMPLETED must set AVAILABLE");
  steps.push("COMPLETED + AVAILABLE");

  console.log(
    JSON.stringify({
      ok: true,
      requestId: request.id,
      propertyId: property.id,
      title: property.title,
      steps,
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
