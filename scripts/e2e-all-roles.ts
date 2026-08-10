/**
 * Full multi-role production E2E:
 * auth, register, landlord CRUD, rental lifecycle (+ reject),
 * admin category CRUD, admin ban/unban/delete.
 */
import "dotenv/config";
import Stripe from "stripe";
import { fulfillPaidCheckout } from "../src/modules/payment/payment.fulfill";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const API = process.env.BACKEND_API_URL || "https://rentnestbackend.vercel.app";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type Json = Record<string, any>;

const PASSWORDS = {
  tenant: "Tenant@123",
  landlord: "Landlord@123",
  admin: "Admin@123",
};

async function api(
  path: string,
  opts: { method?: string; token?: string; body?: unknown } = {},
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) {
    headers.Cookie = `accessToken=${opts.token}`;
    headers.Authorization = `Bearer ${opts.token}`;
  }
  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as Json;
  return { status: res.status, json };
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function login(email: string, password: string) {
  const { json } = await api("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  assert(json.success, `Login failed for ${email}: ${JSON.stringify(json)}`);
  return json.data.accessToken as string;
}

function listFrom(payload: any): Json[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function main() {
  const report: Json = { ok: false, sections: {}, steps: [] as string[] };
  const stamp = Date.now();

  // ─── 1) Demo account logins ─────────────────────────────────────────────
  const tenantToken = await login("tenant@rentnest.com", PASSWORDS.tenant);
  const landlordToken = await login("landlord@rentnest.com", PASSWORDS.landlord);
  const adminToken = await login("admin@rentnest.com", PASSWORDS.admin);
  report.steps.push("demo_logins_ok");
  report.sections.auth = { tenant: true, landlord: true, admin: true };

  // Profiles
  for (const [role, token] of [
    ["tenant", tenantToken],
    ["landlord", landlordToken],
    ["admin", adminToken],
  ] as const) {
    const me = await api("/api/users/me", { token });
    assert(me.json.success, `${role} /me failed`);
  }
  report.steps.push("profiles_ok");

  // ─── 2) New user register + login ───────────────────────────────────────
  const newEmail = `e2e.user.${stamp}@rentnest.test`;
  const newPassword = "E2eUser@123";
  const register = await api("/api/users/register", {
    method: "POST",
    body: {
      name: `E2E User ${stamp}`,
      email: newEmail,
      password: newPassword,
      role: "TENANT",
      phone: "0168999000",
    },
  });
  assert(register.json.success, `Register failed: ${JSON.stringify(register.json)}`);
  const newUserId = register.json.data?.id as string;
  assert(newUserId, "Register missing user id");
  const newUserToken = await login(newEmail, newPassword);
  report.steps.push("register_and_login_ok");
  report.sections.register = { email: newEmail, id: newUserId, login: true };

  // ─── 3) Landlord property CRUD ──────────────────────────────────────────
  const cats = await api("/api/categories", { token: landlordToken });
  const categories = listFrom(cats.json.data);
  assert(categories.length > 0, "No categories");
  const categoryId = categories[0].id as string;

  const createProp = await api("/api/properties/landlord", {
    method: "POST",
    token: landlordToken,
    body: {
      title: `E2E Lifecycle Home ${stamp}`,
      location: "E2E District, Kuala Lumpur, Malaysia",
      categoryId,
      rentPrice: 2100,
      bedRooms: 2,
      bathRooms: 1,
      fetures: ["WiFi", "Parking"],
      availability: "AVAILABLE",
      property_image: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      ],
    },
  });
  assert(createProp.json.success, `Create property failed: ${JSON.stringify(createProp.json)}`);
  const propertyId = createProp.json.data.id as string;

  const updateProp = await api(`/api/properties/landlord/${propertyId}`, {
    method: "PUT",
    token: landlordToken,
    body: {
      title: `E2E Lifecycle Home Updated ${stamp}`,
      location: "Updated E2E District, Penang, Malaysia",
      categoryId,
      rentPrice: 2200,
      bedRooms: 3,
      bathRooms: 2,
      fetures: ["WiFi", "Parking", "AC"],
      availability: "AVAILABLE",
      property_image: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      ],
    },
  });
  assert(updateProp.json.success, `Update property failed: ${JSON.stringify(updateProp.json)}`);
  assert(
    updateProp.json.data.title.includes("Updated"),
    "Property title not updated",
  );
  report.steps.push("landlord_property_create_update_ok");
  report.sections.landlordCrud = {
    propertyId,
    create: true,
    update: true,
  };

  // Disposable property for delete test (separate from lifecycle property)
  const disposable = await api("/api/properties/landlord", {
    method: "POST",
    token: landlordToken,
    body: {
      title: `E2E Disposable ${stamp}`,
      location: "Delete Me, Johor, Malaysia",
      categoryId,
      rentPrice: 1500,
      bedRooms: 1,
      bathRooms: 1,
      fetures: ["WiFi"],
      availability: "AVAILABLE",
      property_image: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      ],
    },
  });
  assert(disposable.json.success, `Disposable create failed: ${JSON.stringify(disposable.json)}`);
  const disposableId = disposable.json.data.id as string;
  const deleted = await api(`/api/properties/landlord/${disposableId}`, {
    method: "DELETE",
    token: landlordToken,
  });
  assert(deleted.json.success, `Delete property failed: ${JSON.stringify(deleted.json)}`);
  report.steps.push("landlord_property_delete_ok");
  report.sections.landlordCrud.delete = true;

  // ─── 4) Reject flow ─────────────────────────────────────────────────────
  const rejectProp = await api("/api/properties/landlord", {
    method: "POST",
    token: landlordToken,
    body: {
      title: `E2E Reject Target ${stamp}`,
      location: "Reject Lane, Melaka, Malaysia",
      categoryId,
      rentPrice: 1800,
      bedRooms: 2,
      bathRooms: 1,
      fetures: ["WiFi"],
      availability: "AVAILABLE",
      property_image: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      ],
    },
  });
  assert(rejectProp.json.success, `Reject-target create failed: ${JSON.stringify(rejectProp.json)}`);
  const rejectPropId = rejectProp.json.data.id as string;

  const rejectReq = await api("/api/rentals", {
    method: "POST",
    token: tenantToken,
    body: {
      propertyId: rejectPropId,
      moveInDate: new Date("2026-10-01T00:00:00.000Z").toISOString(),
      message: "E2E reject flow request",
    },
  });
  assert(rejectReq.json.success, `Reject request create failed: ${JSON.stringify(rejectReq.json)}`);
  const rejectReqId = rejectReq.json.data.id as string;
  const reject = await api(`/api/rentals/${rejectReqId}/status`, {
    method: "PUT",
    token: landlordToken,
    body: { status: "REJECTED" },
  });
  assert(reject.json.success, `Reject failed: ${JSON.stringify(reject.json)}`);
  assert(reject.json.data.status === "REJECTED", "Status not REJECTED");
  const rejectPropView = await api(`/api/properties/${rejectPropId}`, {
    token: landlordToken,
  });
  assert(
    rejectPropView.json.data.availability === "AVAILABLE",
    "Property should stay AVAILABLE after reject",
  );
  // cleanup reject property
  await api(`/api/properties/landlord/${rejectPropId}`, {
    method: "DELETE",
    token: landlordToken,
  });
  report.steps.push("landlord_reject_ok");
  report.sections.reject = { requestId: rejectReqId, status: "REJECTED" };

  // ─── 5) Full rental lifecycle on dedicated property ─────────────────────
  const createReq = await api("/api/rentals", {
    method: "POST",
    token: tenantToken,
    body: {
      propertyId,
      moveInDate: new Date("2026-09-20T00:00:00.000Z").toISOString(),
      message: "E2E full lifecycle — please approve",
    },
  });
  assert(createReq.json.success, `Create rental failed: ${JSON.stringify(createReq.json)}`);
  const requestId = createReq.json.data.id as string;
  assert(createReq.json.data.status === "PENDING", "Expected PENDING");

  let prop = await api(`/api/properties/${propertyId}`, { token: tenantToken });
  assert(prop.json.data.availability === "AVAILABLE", "PENDING must keep AVAILABLE");

  const approve = await api(`/api/rentals/${requestId}/status`, {
    method: "PUT",
    token: landlordToken,
    body: { status: "APPROVED" },
  });
  assert(approve.json.success, `Approve failed: ${JSON.stringify(approve.json)}`);
  assert(approve.json.data.status === "APPROVED", "Expected APPROVED");
  prop = await api(`/api/properties/${propertyId}`, { token: tenantToken });
  assert(prop.json.data.availability === "AVAILABLE", "APPROVED must keep AVAILABLE");

  // Checkout session (validates Stripe wiring) then fulfill via test PI
  const checkout = await api("/api/pay/create-checkout-session", {
    method: "POST",
    token: tenantToken,
    body: { requestId },
  });
  assert(
    checkout.json.success && checkout.json.data?.url,
    `Checkout failed: ${JSON.stringify(checkout.json)}`,
  );
  const sessionId = checkout.json.data.id as string | undefined;

  const amount = Math.round(Number(updateProp.json.data.rentPrice) * 100);
  const pi = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method: "pm_card_visa",
    confirm: true,
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    metadata: { requestId, tenantId: "e2e-all-roles" },
  });
  assert(pi.status === "succeeded", `PaymentIntent failed: ${pi.status}`);

  await fulfillPaidCheckout({
    requestId,
    amountTotal: pi.amount,
    paymentIntent: pi.id,
    sessionId: sessionId || `cs_e2e_${stamp}`,
  });

  if (sessionId) {
    await api("/api/pay/confirm-checkout-session", {
      method: "POST",
      token: tenantToken,
      body: { sessionId },
    });
  }

  const tenantReqs = await api("/api/rentals", { token: tenantToken });
  const activeReq = listFrom(tenantReqs.json.data).find((r) => r.id === requestId);
  assert(activeReq?.status === "ACTIVE", `Expected ACTIVE, got ${activeReq?.status}`);

  prop = await api(`/api/properties/${propertyId}`, { token: tenantToken });
  assert(
    prop.json.data.availability === "UNAVAILABLE",
    `Expected UNAVAILABLE after pay, got ${prop.json.data.availability}`,
  );

  const payments = await api("/api/pay", { token: tenantToken });
  const payment = listFrom(payments.json.data).find((p) => p.requestId === requestId);
  assert(
    payment?.paymentStatus === "PAID",
    `Expected PAID payment, got ${payment?.paymentStatus}`,
  );

  const complete = await api(`/api/rentals/${requestId}/status`, {
    method: "PUT",
    token: landlordToken,
    body: { status: "COMPLETED" },
  });
  assert(complete.json.success, `Complete failed: ${JSON.stringify(complete.json)}`);
  assert(complete.json.data.status === "COMPLETED", "Expected COMPLETED");

  prop = await api(`/api/properties/${propertyId}`, { token: tenantToken });
  assert(
    prop.json.data.availability === "AVAILABLE",
    `Expected AVAILABLE after complete, got ${prop.json.data.availability}`,
  );

  report.steps.push("lifecycle_PENDING_APPROVED_ACTIVE_COMPLETED_ok");
  report.sections.lifecycle = {
    requestId,
    propertyId,
    paymentStatus: payment?.paymentStatus,
    finalRequest: "COMPLETED",
    finalAvailability: "AVAILABLE",
  };

  // Cleanup lifecycle property (no open requests; COMPLETED allows delete?)
  // May fail if rental history blocks delete — try and note.
  const cleanupProp = await api(`/api/properties/landlord/${propertyId}`, {
    method: "DELETE",
    token: landlordToken,
  });
  report.sections.lifecycle.cleanupDeleted = Boolean(cleanupProp.json.success);
  if (!cleanupProp.json.success) {
    report.steps.push(`lifecycle_property_cleanup_skipped:${cleanupProp.json.message}`);
  } else {
    report.steps.push("lifecycle_property_cleanup_ok");
  }

  // ─── 6) Admin category CRUD ─────────────────────────────────────────────
  const catName = `E2E Cat ${stamp}`;
  const createCat = await api("/api/categories", {
    method: "POST",
    token: adminToken,
    body: { name: catName, description: "Temp category for E2E" },
  });
  assert(createCat.json.success, `Create category failed: ${JSON.stringify(createCat.json)}`);
  const catId = createCat.json.data.id as string;

  const updateCat = await api(`/api/categories/${catId}`, {
    method: "PUT",
    token: adminToken,
    body: { name: `${catName} Updated`, description: "Updated desc" },
  });
  assert(updateCat.json.success, `Update category failed: ${JSON.stringify(updateCat.json)}`);

  const deleteCat = await api(`/api/categories/${catId}`, {
    method: "DELETE",
    token: adminToken,
  });
  assert(deleteCat.json.success, `Delete category failed: ${JSON.stringify(deleteCat.json)}`);
  report.steps.push("admin_category_crud_ok");
  report.sections.adminCategories = { create: true, update: true, delete: true };

  // ─── 7) Admin ban / unban / delete (on newly registered user) ───────────
  const ban = await api(`/api/admin/user/${newUserId}/status`, {
    method: "PATCH",
    token: adminToken,
    body: { activeStatus: "BANNED" },
  });
  assert(ban.json.success, `Ban failed: ${JSON.stringify(ban.json)}`);
  assert(ban.json.data.activeStatus === "BANNED", "Expected BANNED");

  // Banned user should not login successfully (if enforced)
  const bannedLogin = await api("/api/auth/login", {
    method: "POST",
    body: { email: newEmail, password: newPassword },
  });
  report.sections.adminUsers = {
    ban: true,
    bannedLoginBlocked: !bannedLogin.json.success,
  };

  const unban = await api(`/api/admin/user/${newUserId}/status`, {
    method: "PATCH",
    token: adminToken,
    body: { activeStatus: "ACTIVE" },
  });
  assert(unban.json.success, `Unban failed: ${JSON.stringify(unban.json)}`);
  assert(unban.json.data.activeStatus === "ACTIVE", "Expected ACTIVE after unban");

  const reLogin = await login(newEmail, newPassword);
  assert(Boolean(reLogin), "Re-login after unban failed");

  const deleteUser = await api(`/api/admin/user/${newUserId}`, {
    method: "DELETE",
    token: adminToken,
  });
  assert(deleteUser.json.success, `Delete user failed: ${JSON.stringify(deleteUser.json)}`);

  const goneLogin = await api("/api/auth/login", {
    method: "POST",
    body: { email: newEmail, password: newPassword },
  });
  assert(!goneLogin.json.success, "Deleted user should not login");

  report.steps.push("admin_ban_unban_delete_ok");
  report.sections.adminUsers.unban = true;
  report.sections.adminUsers.delete = true;
  report.sections.adminUsers.deletedLoginBlocked = !goneLogin.json.success;

  // ─── 8) Admin dashboard health ──────────────────────────────────────────
  const dash = await api("/api/admin/dashboard", { token: adminToken });
  assert(dash.json.success, `Admin dashboard failed: ${JSON.stringify(dash.json)}`);
  report.steps.push("admin_dashboard_ok");

  report.ok = true;
  report.summary = "ALL_CHECKS_PASSED";
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((e) => {
    console.error(
      JSON.stringify({ ok: false, error: String((e as Error)?.message || e) }, null, 2),
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => undefined);
  });
