import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// 🌟 1. Standard CORS Middleware Setup
app.use(cors({
    origin: true, // Yeh automatic request bhejne wale link ko allow kar deta hai
    credentials: true // Cookies transfer karne ke liye yeh zaroori hai
}));

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
import inventoryRouter from "./routes/inventory.route.js";
import allocateRouter from "./routes/allocation.route.js"


// 🌟 5. Routes Definition
app.use("/api/v1/users", userRouter);
app.use("/api/v1/requests", requestRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/allocate", allocateRouter);

export { app };