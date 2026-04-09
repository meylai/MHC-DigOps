import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", applicationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("MHC-DigiOps API Running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});



//# SourceMappingURL=index.js.map   
