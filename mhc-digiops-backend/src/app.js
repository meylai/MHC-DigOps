import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { Server } from "socket.io";
import http from "http";
import houseRoutes from "./routes/houseRoutes.js";
import landAcquisitionRoutes from "./routes/landAcquisitionRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import paychanguPaymentRoutes from "./routes/paychanguPaymentRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../../mhc-digiops-frontend")));
app.set("io", io);

app.use("/api", authRoutes);
app.use("/api", applicationRoutes);
app.use("/api", maintenanceRoutes);
app.use("/api", paymentRoutes);
app.use("/api", paychanguPaymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/land-acquisition", landAcquisitionRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api", notificationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("MHC-DigiOps API Running");
});

io.on("Connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Server running on port 3000");
});



//# SourceMappingURL=index.js.map   
