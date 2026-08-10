import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  const sessions = await stripe.checkout.sessions.list({ limit: 5 });
  for (const s of sessions.data) {
    console.log(
      JSON.stringify({
        id: s.id,
        status: s.status,
        payment_status: s.payment_status,
        success_url: s.success_url,
        cancel_url: s.cancel_url,
        requestId: s.metadata?.requestId ?? null,
        created: new Date(s.created * 1000).toISOString(),
      }),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
