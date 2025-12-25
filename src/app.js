import express from "express";
import coaRoutes from "./routes/coa.routes.js";

const app = express();

app.use(express.json());
app.use("/coa", coaRoutes);

export default app;
