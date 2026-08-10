/**
 * Prepare one APPROVED unpaid rental for Demo Tenant so payment can be retested.
 * Prefers an existing APPROVED request; otherwise resets a COMPLETED/ACTIVE demo rental.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../prisma/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenant = await prisma.user.findFirst({
    where: { email: "tenant@rentnest.com" },
    select: { id: true, email: true },
  });
  if (!tenant) throw new Error("Demo tenant not found");

  const approved = await prisma.rentalRequest.findFirst({
    where: { tenantId: tenant.id, status: "APPROVED", payment: null },
    include: {
      property: { select: { id: true, title: true, availability: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (approved) {
    await prisma.property.update({
      where: { id: approved.propertyId },
      data: { availability: "AVAILABLE" },
    });
    console.log(
      JSON.stringify({
        ready: true,
        requestId: approved.id,
        title: approved.property.title,
        status: approved.status,
      }),
    );
    return;
  }

  const reusable = await prisma.rentalRequest.findFirst({
    where: {
      tenantId: tenant.id,
      status: { in: ["COMPLETED", "ACTIVE", "APPROVED"] },
    },
    include: {
      property: { select: { id: true, title: true } },
      payment: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!reusable) throw new Error("No demo rental found to reset");

  if (reusable.payment) {
    await prisma.payment.delete({ where: { id: reusable.payment.id } });
  }

  await prisma.$transaction([
    prisma.rentalRequest.update({
      where: { id: reusable.id },
      data: { status: "APPROVED" },
    }),
    prisma.property.update({
      where: { id: reusable.propertyId },
      data: { availability: "AVAILABLE" },
    }),
  ]);

  console.log(
    JSON.stringify({
      ready: true,
      reset: true,
      requestId: reusable.id,
      title: reusable.property.title,
      status: "APPROVED",
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
