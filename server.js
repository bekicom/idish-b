require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConfig = require("./config/dbConfig");
const routes = require("./routes/routes");
const { createServer } = require("node:http");
const soket = require("./socket");

const PORT = process.env.PORT || 8051;
const app = express();
const server = createServer(app);
const io = require("./middlewares/socket.header")(server);

// ✅ Ruxsat berilgan domenlar
const allowedOrigins = [

  "https://idish16102025.richman.uz", // 🔹 sizning subdomeningiz

];

// ✅ CORS sozlamalari
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS bloklandi: " + origin));
      }
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔌 Database ulanishi
dbConfig();

// 🔌 Socket.io integratsiyasi
app.set("socket", io);
soket.connect(io);

// 🔗 API yo‘llar
app.use("/api", routes);

// 🚀 Serverni ishga tushirish
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
