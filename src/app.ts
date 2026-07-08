import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { userRouter } from "./modules/users/user.routers";
import { authRouter } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/admin/admin.router";
import { propertiesRouter } from "./modules/properties/properties.routers";
import { categoryRouter } from "./modules/propertyCatagory/catagoty.routers";

// import { userRoutes } from "./modules/user/user.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

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

export default app;