import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// 🌟 1. Standard CORS Middleware Setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// 🌟 2. Path-To-Regexp Safe Pre-flight Handler (No Strings, No Wildcards!)
// Yeh har incoming request ko check karega aur OPTIONS ko 200 OK dekar pass karega
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); 
  }
  next();
});

// 🌟 3. Baki ke Saare Standard Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// 🌟 4. Router Imports
import userRouter from "./routes/user.route.js";
import requestRouter from "./routes/request.route.js";
import disasterRouter from "./routes/disaster.route.js";
import inventoryRouter from "./routes/inventory.route.js";
import resourceRouter from "./routes/resource.route.js";


// 🌟 5. Routes Definition
app.use("/api/v1/users", userRouter);
app.use("/api/v1/requests", requestRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/disasters", disasterRouter);
app.use("/api/v1/resources", resourceRouter);

export { app };