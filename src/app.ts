import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { userRouter } from "./modules/users/user.routers";
import { authRouter } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/admin/admin.router";
import { propertiesRouter } from "./modules/properties/properties.routers";
import { categoryRouter } from "./modules/propertyCatagory/catagoty.routers";
import { rentlRequestRouter } from "./modules/RentalRequest/rental.routers";
import { revewRouter } from "./modules/review/review.router";
import { paymentRoutes } from "./modules/payment/payment.router";



import { stripeWebhook } from "./modules/payment/webhook.controller";


// import { userRoutes } from "./modules/user/user.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);


// Add this  In server.ts or app.ts
app.post("/api/subscription/webhook", express.raw({ type: "application/json" }), stripeWebhook);


// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/users", userRouter);
app.use("/api/auth",authRouter)
app.use("/api/admin",adminRouter)
app.use("/api/properties",propertiesRouter)
app.use("/api/categories", categoryRouter);
app.use("/api/rentals",rentlRequestRouter);
app.use("/api/review",revewRouter)
app.use("/api/pay", paymentRoutes);

export default app;