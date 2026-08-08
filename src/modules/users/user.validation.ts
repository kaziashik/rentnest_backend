import { z } from "zod";

export const registerValidationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["TENANT", "LANDLORD"]),
  phone: z.string().min(8, "Valid phone number is required"),
  photo: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional(),
});

export const updateProfileValidationSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  password: z.string().min(6).optional(),
  photo: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
});
