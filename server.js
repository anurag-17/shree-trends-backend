// const express = require('express');
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const next = require('next');
// const mongoose = require('mongoose');
// require('dotenv').config();
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();
// const connectDB = require("./Utils/db") 
// // console.log(process.env);

// const corsOptions = {
//   origin: [
//   "http://localhost:3000",
//   "*",
//   "https://shri-trends-a3k4.vercel.app"
// ],
//   credentials: true,
// };

// app.prepare().then(() => {
//   const server = express();
//   server.use(express.json({ limit: "50mb" }));
//   server.use(express.urlencoded({ limit: "500kb", extended: true }));
//   server.use(bodyParser.urlencoded({ extended: true }));
//   server.use(cors(corsOptions));
//   connectDB();

//   // Routers
//   server.use('/api/auth', require("./Route/AuthRouter"));
//   server.use("/api/vendor", require("./Route/vendorRouter"));
//   server.use("/api/product", require("./Route/ProductRouter"));

//   // Next.js request handling
//   // server.get('*', (req, res) => {
//   //   return handle(req, res);
//   // });

//   const PORT = process.env.PORT || 4000;
//   server.listen(PORT, '0.0.0.0', (err) => {
//     if (err) throw err;
//     console.log(`> Ready on http://localhost:${PORT}`);
//   });
// });

require("dotenv").config({ path: "./.env" });
const express = require("express");
const connectDB = require("./Utils/db");
// const mongoose = require("mongoose");
// const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");

// Connect Database
connectDB();

const app = express();

const corsOptions = {
  origin: [
  "http://localhost:3000",
  "https://shri-trends-front.vercel.app",
  "https://shri-trends-front.vercel.app/",
  "*"
],
  credentials: true, 
};

app.use(cors(corsOptions));

app.use(express.json());
// app.use(cors({ origin: "*" }));
app.use(cookieParser('secret'));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use('/api/auth', require("./Route/AuthRouter"));
app.use("/api/vendor", require("./Route/vendorRouter"));
app.use("/api/product", require("./Route/ProductRouter"));
app.use('/api/admin', require("./Route/adminRouter"));
app.use('/api/wallet', require("./Route/walletRouter"));

// Error Handler 
// app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () =>

  console.log(`> Ready on http://localhost:${PORT}`)
);
