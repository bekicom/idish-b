require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConfig = require("./config/dbConfig");
const routes = require("./routes/routes");
const PORT = process.env.PORT || 8080;

const { createServer } = require("node:http");
const soket = require("./socket");
const app = express();
const server = createServer(app);
const io = require("./middlewares/socket.header")(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); 

dbConfig();

app.set("socket", io);
soket.connect(io);
app.use("/api", routes);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
