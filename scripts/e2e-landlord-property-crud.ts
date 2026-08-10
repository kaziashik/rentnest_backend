/**
 * Landlord CRUD E2E against production:
 * create → update → delete as landlord@rentnest.com
 */
import "dotenv/config";

const API = process.env.BACKEND_API_URL || "https://rentnestbackend.vercel.app";

type Json = Record<string, any>;

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

async function main() {
  const report: Json = { ok: false, steps: [], errors: [] };

  const login = await api("/api/auth/login", {
    method: "POST",
    body: { email: "landlord@rentnest.com", password: "Landlord@123" },
  });
  assert(login.json.success, `Login failed: ${JSON.stringify(login.json)}`);
  const token = login.json.data.accessToken as string;
  report.steps.push("login_ok");

  const cats = await api("/api/categories", { token });
  const categories = (Array.isArray(cats.json.data) ? cats.json.data : []) as Json[];
  assert(categories.length > 0, "No categories available");
  const categoryId = categories[0].id as string;
  report.category = { id: categoryId, name: categories[0].name };
  report.steps.push("category_loaded");

  const stamp = Date.now();
  const createPayload = {
    title: `E2E Test Villa ${stamp}`,
    location: "Test District, Kuala Lumpur, Malaysia",
    categoryId,
    rentPrice: 2500,
    bedRooms: 3,
    bathRooms: 2,
    fetures: ["Pool", "Parking", "WiFi"],
    availability: "AVAILABLE",
    property_image: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    ],
  };

  const created = await api("/api/properties/landlord", {
    method: "POST",
    token,
    body: createPayload,
  });
  if (!created.json.success) {
    report.errors.push({ step: "create", response: created.json });
    throw new Error(`Create failed: ${JSON.stringify(created.json)}`);
  }
  const propertyId = created.json.data.id as string;
  report.created = {
    id: propertyId,
    title: created.json.data.title,
    rentPrice: created.json.data.rentPrice,
    availability: created.json.data.availability,
  };
  report.steps.push("create_ok");

  // Verify appears in my-properties
  const mineAfterCreate = await api("/api/properties/my-properties", { token });
  const list = (Array.isArray(mineAfterCreate.json.data)
    ? mineAfterCreate.json.data
    : []) as Json[];
  assert(
    list.some((p) => p.id === propertyId),
    "Created property missing from my-properties",
  );
  report.steps.push("listed_in_my_properties");

  // Public get by id
  const byId = await api(`/api/properties/${propertyId}`, { token });
  assert(byId.json.success, `Get by id failed: ${JSON.stringify(byId.json)}`);
  report.steps.push("get_by_id_ok");

  const updatePayload = {
    title: `E2E Test Villa Updated ${stamp}`,
    location: "Updated Location, Penang, Malaysia",
    categoryId,
    rentPrice: 2800,
    bedRooms: 4,
    bathRooms: 3,
    fetures: ["Pool", "Gym", "Security"],
    availability: "UNAVAILABLE",
    property_image: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
  };

  const updated = await api(`/api/properties/landlord/${propertyId}`, {
    method: "PUT",
    token,
    body: updatePayload,
  });
  if (!updated.json.success) {
    report.errors.push({ step: "update", response: updated.json });
    throw new Error(`Update failed: ${JSON.stringify(updated.json)}`);
  }
  report.updated = {
    id: updated.json.data.id,
    title: updated.json.data.title,
    location: updated.json.data.location,
    rentPrice: String(updated.json.data.rentPrice),
    bedRooms: updated.json.data.bedRooms,
    bathRooms: updated.json.data.bathRooms,
    availability: updated.json.data.availability,
    imageCount: Array.isArray(updated.json.data.property_image)
      ? updated.json.data.property_image.length
      : 0,
  };
  assert(
    updated.json.data.title === updatePayload.title,
    "Title not updated",
  );
  assert(
    updated.json.data.availability === "UNAVAILABLE",
    "Availability not updated",
  );
  assert(Number(updated.json.data.rentPrice) === 2800, "Rent price not updated");
  report.steps.push("update_ok");

  const deleted = await api(`/api/properties/landlord/${propertyId}`, {
    method: "DELETE",
    token,
  });
  if (!deleted.json.success) {
    report.errors.push({ step: "delete", response: deleted.json });
    throw new Error(`Delete failed: ${JSON.stringify(deleted.json)}`);
  }
  report.steps.push("delete_ok");

  const mineAfterDelete = await api("/api/properties/my-properties", { token });
  const list2 = (Array.isArray(mineAfterDelete.json.data)
    ? mineAfterDelete.json.data
    : []) as Json[];
  assert(
    !list2.some((p) => p.id === propertyId),
    "Deleted property still in my-properties",
  );
  report.steps.push("removed_from_my_properties");

  const gone = await api(`/api/properties/${propertyId}`, { token });
  assert(
    !gone.json.success || gone.status >= 400,
    "Deleted property still fetchable by id",
  );
  report.steps.push("get_by_id_after_delete_fails");

  report.ok = true;
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e?.message || e) }));
  process.exit(1);
});
