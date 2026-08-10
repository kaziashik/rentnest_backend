/**
 * Seeds themed categories + 10 landlord properties with multi-image Unsplash galleries.
 * Target: production RentNest API (or BACKEND_API_URL).
 *
 * Usage: node scripts/seed-demo-properties.mjs
 */

const API = (process.env.BACKEND_API_URL || "https://rentnestbackend.vercel.app").replace(
  /\/$/,
  "",
);

const img = (id, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const CATEGORIES = [
  {
    name: "Swimming Pool House",
    description: "Homes with private or resort-style swimming pools",
  },
  {
    name: "Gym House",
    description: "Properties with in-home or private gym facilities",
  },
  {
    name: "Honeymoon Nature View",
    description: "Romantic nature-view retreats for couples",
  },
  {
    name: "Hiking View House",
    description: "Homes near hiking trails with mountain scenery",
  },
];

/** 10 properties — 3 pool, 2 gym, 2 honeymoon, 2 hiking, 1 premium mix */
const PROPERTIES = [
  {
    categoryName: "Swimming Pool House",
    title: "Azure Infinity Pool Villa",
    location: "Langkawi, Kedah, Malaysia",
    rentPrice: 4200,
    bedRooms: 4,
    bathRooms: 3,
    fetures: [
      "Private infinity pool",
      "Outdoor lounge",
      "Wi‑Fi",
      "Air conditioning",
      "BBQ deck",
      "Parking",
    ],
    property_image: [
      img("photo-1613490493576-7fde63acd811"),
      img("photo-1564013799919-ab600027ffc6"),
      img("photo-1575429198097-0414ec08e8cd"),
      img("photo-1519315901367-f34ff9154487"),
      img("photo-1530549387789-4c1017266635"),
    ],
  },
  {
    categoryName: "Swimming Pool House",
    title: "Palm Bay Swim Estate",
    location: "Port Dickson, Negeri Sembilan, Malaysia",
    rentPrice: 3800,
    bedRooms: 5,
    bathRooms: 4,
    fetures: [
      "Resort swimming pool",
      "Garden cabana",
      "Smart TV",
      "Full kitchen",
      "Laundry",
      "Security",
    ],
    property_image: [
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1540541338287-41700207dee6"),
      img("photo-1600566753086-00f18fb6b3ea"),
      img("photo-1566073771259-6a8506099945"),
      img("photo-1500375592092-40eb2168fd21"),
    ],
  },
  {
    categoryName: "Swimming Pool House",
    title: "Lagoon Courtyard Pool House",
    location: "Melaka City, Melaka, Malaysia",
    rentPrice: 3100,
    bedRooms: 3,
    bathRooms: 2,
    fetures: [
      "Courtyard pool",
      "Sun deck",
      "Wi‑Fi",
      "Air conditioning",
      "Guest bath",
      "Covered parking",
    ],
    property_image: [
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600607687939-ce8a6c25118c"),
      img("photo-1600965962102-9d260a71890d"),
      img("photo-1530549387789-4c1017266635"),
      img("photo-1507525428034-b723cf961d3e"),
    ],
  },
  {
    categoryName: "Gym House",
    title: "Active Life Gym Residence",
    location: "Mont Kiara, Kuala Lumpur, Malaysia",
    rentPrice: 4500,
    bedRooms: 3,
    bathRooms: 3,
    fetures: [
      "Private home gym",
      "Yoga studio corner",
      "Mirror wall",
      "Wi‑Fi",
      "Air conditioning",
      "Underground parking",
    ],
    property_image: [
      img("photo-1534438327276-14e5300c3a48"),
      img("photo-1571902943202-507ec2618e8f"),
      img("photo-1518611012118-696072aa579a"),
      img("photo-1571019613454-1cb2f99b2d8b"),
      img("photo-1594737625785-a6cbdabd333c"),
    ],
  },
  {
    categoryName: "Gym House",
    title: "Skyline Fitness Townhouse",
    location: "Bangsar South, Kuala Lumpur, Malaysia",
    rentPrice: 3900,
    bedRooms: 4,
    bathRooms: 3,
    fetures: [
      "Gym equipment room",
      "Cardio zone",
      "City view balcony",
      "Smart home",
      "Wi‑Fi",
      "2-car garage",
    ],
    property_image: [
      img("photo-1558611848-73f7eb4001a1"),
      img("photo-1593079831268-3381b0db4a77"),
      img("photo-1571019614242-c5c5dee9f50b"),
      img("photo-1518310383802-640c2de311b2"),
      img("photo-1484154218962-a197022b5858"),
    ],
  },
  {
    categoryName: "Honeymoon Nature View",
    title: "Honeymoon Hillside Glass House",
    location: "Cameron Highlands, Pahang, Malaysia",
    rentPrice: 5200,
    bedRooms: 2,
    bathRooms: 2,
    fetures: [
      "Panoramic nature view",
      "King suite",
      "Private terrace",
      "Fireplace lounge",
      "Breakfast nook",
      "Parking",
    ],
    property_image: [
      img("photo-1518780664697-55e3ad937233"),
      img("photo-1499793983690-e29da59ef1c2"),
      img("photo-1520250497591-112f2f40a3f4"),
      img("photo-1476514525535-07fb3b4ae5f1"),
      img("photo-1529333166437-7750a6dd5a70"),
    ],
  },
  {
    categoryName: "Honeymoon Nature View",
    title: "Couple’s Valley Retreat",
    location: "Janda Baik, Pahang, Malaysia",
    rentPrice: 4800,
    bedRooms: 2,
    bathRooms: 2,
    fetures: [
      "Forest valley view",
      "Outdoor soaking tub",
      "Romantic lighting",
      "Wi‑Fi",
      "Kitchenette",
      "Private driveway",
    ],
    property_image: [
      img("photo-1449824913935-59a10b8d2000"),
      img("photo-1506905925346-21bda4d32df4"),
      img("photo-1501785888041-af3ef285b470"),
      img("photo-1482192505345-5655af888cc4"),
      img("photo-1469854523086-cc02fe5d8800"),
    ],
  },
  {
    categoryName: "Hiking View House",
    title: "Trailhead Mountain Hiking Lodge",
    location: "Genting Highlands, Pahang, Malaysia",
    rentPrice: 3600,
    bedRooms: 3,
    bathRooms: 2,
    fetures: [
      "Trail access",
      "Mountain sunrise view",
      "Gear storage",
      "Wi‑Fi",
      "Fireplace",
      "Parking",
    ],
    property_image: [
      img("photo-1464822759023-fed622ff2c3b"),
      img("photo-1522163182402-834f871fd851"),
      img("photo-1483728642387-6c3bdd6c93e5"),
      img("photo-1501555088652-021faa106b9b"),
      img("photo-1478131143081-80f7f84ca84d"),
    ],
  },
  {
    categoryName: "Hiking View House",
    title: "Summit Ridge Hiking Cottage",
    location: "Fraser’s Hill, Pahang, Malaysia",
    rentPrice: 3400,
    bedRooms: 2,
    bathRooms: 2,
    fetures: [
      "Hiking path steps away",
      "Cliff-edge deck",
      "Binoculars station",
      "Hot shower",
      "Wi‑Fi",
      "Carport",
    ],
    property_image: [
      img("photo-1454496522488-7a8e488e8606"),
      img("photo-1469474968028-56623f02e42e"),
      img("photo-1500534314209-a25ddb2bd429"),
      img("photo-1504280390367-361c6d9f38f4"),
      img("photo-1523987355523-c7b5b0dd90a7"),
    ],
  },
  {
    categoryName: "Swimming Pool House",
    title: "Coastal Spa Pool Manor",
    location: "Desaru, Johor, Malaysia",
    rentPrice: 5500,
    bedRooms: 5,
    bathRooms: 4,
    fetures: [
      "Ocean-side pool",
      "Spa bath",
      "Chef kitchen",
      "Home cinema",
      "Wi‑Fi",
      "Staff quarters option",
    ],
    property_image: [
      img("photo-1613977257363-707ba9348227"),
      img("photo-1600210492493-0946911123ea"),
      img("photo-1600566753190-17f0baa2a6c3"),
      img("photo-1512917774080-9991f1c4c750"),
      img("photo-1600585154526-990dced4db0d"),
    ],
  },
];

async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success || !json.data?.accessToken) {
    throw new Error(`Login failed for ${email}: ${json.message || res.status}`);
  }
  return json.data.accessToken;
}

async function getCategories() {
  const res = await fetch(`${API}/api/categories`);
  const json = await res.json();
  return json.data || [];
}

async function ensureCategories(adminToken) {
  const existing = await getCategories();
  const byName = new Map(existing.map((c) => [c.name, c]));

  for (const cat of CATEGORIES) {
    if (byName.has(cat.name)) {
      console.log(`Category exists: ${cat.name}`);
      continue;
    }
    const res = await fetch(`${API}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${adminToken}`,
      },
      body: JSON.stringify(cat),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(`Create category "${cat.name}" failed: ${json.message}`);
    }
    console.log(`Created category: ${cat.name}`);
    byName.set(cat.name, json.data);
  }

  // refresh map with ids
  const refreshed = await getCategories();
  return new Map(refreshed.map((c) => [c.name, c]));
}

async function createProperty(landlordToken, payload) {
  const res = await fetch(`${API}/api/properties/landlord`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `accessToken=${landlordToken}`,
    },
    body: JSON.stringify({
      ...payload,
      availability: "AVAILABLE",
    }),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(
      `Create property "${payload.title}" failed: ${json.message || JSON.stringify(json)}`,
    );
  }
  return json.data;
}

async function main() {
  console.log(`API: ${API}`);

  const adminToken = await login("admin@rentnest.com", "Admin@123");
  console.log("Admin logged in");

  const categoryMap = await ensureCategories(adminToken);

  const landlordToken = await login("landlord@rentnest.com", "Landlord@123");
  console.log("Landlord logged in");

  let created = 0;
  for (const prop of PROPERTIES) {
    const category = categoryMap.get(prop.categoryName);
    if (!category?.id) {
      throw new Error(`Missing category: ${prop.categoryName}`);
    }

    const { categoryName, ...rest } = prop;
    const data = await createProperty(landlordToken, {
      ...rest,
      categoryId: category.id,
    });
    created += 1;
    console.log(
      `✓ ${created}. ${data.title} (${categoryName}) — ${rest.property_image.length} images`,
    );
  }

  console.log(`\nDone. Created ${created} properties for landlord@rentnest.com`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
