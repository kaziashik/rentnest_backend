import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function upsertUser(data: {
  name: string;
  email: string;
  password: string;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  phone: string;
}) {
  const hash = await bcrypt.hash(
    data.password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  );

  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      password: hash,
      role: data.role,
      phone: data.phone,
      activeStatus: "ACTIVE",
    },
    create: {
      name: data.name,
      email: data.email,
      password: hash,
      role: data.role,
      phone: data.phone,
      activeStatus: "ACTIVE",
    },
  });
}

async function main() {
  await upsertUser({
    name: "Demo Tenant",
    email: "tenant@rentnest.com",
    password: "Tenant@123",
    role: "TENANT",
    phone: "0168000001",
  });
  await upsertUser({
    name: "Demo Landlord",
    email: "landlord@rentnest.com",
    password: "Landlord@123",
    role: "LANDLORD",
    phone: "0168000002",
  });
  await upsertUser({
    name: "Demo Admin",
    email: "admin@rentnest.com",
    password: "Admin@123",
    role: "ADMIN",
    phone: "0168000003",
  });

  console.info("Demo users ready:");
  console.info("  tenant@rentnest.com / Tenant@123");
  console.info("  landlord@rentnest.com / Landlord@123");
  console.info("  admin@rentnest.com / Admin@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
