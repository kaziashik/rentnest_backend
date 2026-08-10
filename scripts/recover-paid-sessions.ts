/**
 * Find paid Stripe Checkout sessions that never wrote a Payment row,
 * and fulfill them (ACTIVE rental + UNAVAILABLE property).
 */
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import Stripe from "stripe";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { fulfillPaidCheckout } from "../src/modules/payment/payment.fulfill";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  const sessions = await stripe.checkout.sessions.list({
    limit: 50,
    status: "complete",
  });

  let recovered = 0;
  let skipped = 0;

  for (const session of sessions.data) {
    if (session.payment_status !== "paid") {
      skipped += 1;
      continue;
    }

    const requestId = session.metadata?.requestId;
    if (!requestId) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.payment.findUnique({ where: { requestId } });
    if (existing?.paymentStatus === "PAID") {
      skipped += 1;
      continue;
    }

    const result = await fulfillPaidCheckout({
      requestId,
      amountTotal: session.amount_total,
      paymentIntent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      sessionId: session.id,
    });

    console.log(
      JSON.stringify({
        requestId,
        sessionId: session.id,
        alreadyFulfilled: result.alreadyFulfilled,
      }),
    );
    recovered += 1;
  }

  console.log(JSON.stringify({ recovered, skipped, scanned: sessions.data.length }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
