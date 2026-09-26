import express from "express";
import cors from "cors";
import orderRoutes from "./routes/order.routes.js";
import loadRoutes from "./routes/load.routes.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "NewCron API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/orders", orderRoutes);
app.use("/api/loads", loadRoutes);

export default app;
