/**
 * Prove production create-checkout-session now returns a success_url with session_id.
 */
import "dotenv/config";

const API = process.env.BACKEND_API_URL || "https://rentnestbackend.vercel.app";

async function main() {
  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "tenant@rentnest.com",
      password: "Tenant@123",
    }),
  });
  const login = await loginRes.json();
  if (!login?.success) {
    throw new Error(`Login failed: ${JSON.stringify(login)}`);
  }
  const token = login.data.accessToken as string;

  const rentalsRes = await fetch(`${API}/api/rentals`, {
    headers: { Cookie: `accessToken=${token}` },
  });
  const rentals = await rentalsRes.json();
  const approved = (rentals.data ?? []).find(
    (r: { status: string }) => r.status === "APPROVED",
  );
  if (!approved) throw new Error("No APPROVED rental for demo tenant");

  const checkoutRes = await fetch(`${API}/api/pay/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `accessToken=${token}`,
    },
    body: JSON.stringify({ requestId: approved.id }),
  });
  const checkout = await checkoutRes.json();
  if (!checkout?.success || !checkout?.data?.url) {
    throw new Error(`Checkout failed: ${JSON.stringify(checkout)}`);
  }

  // Retrieve the newest session and print success_url
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sessions = await stripe.checkout.sessions.list({ limit: 1 });
  const latest = sessions.data[0];

  console.log(
    JSON.stringify({
      requestId: approved.id,
      title: approved.property?.title,
      checkoutUrlHost: new URL(checkout.data.url).host,
      success_url: latest?.success_url,
      hasSessionIdPlaceholder: Boolean(
        latest?.success_url?.includes("{CHECKOUT_SESSION_ID}"),
      ),
      usesPaymentSuccessPath: Boolean(
        latest?.success_url?.includes("/payment/success"),
      ),
    }),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
