const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
      // .replace(/:/g, "-")
    );
  },
});

const fileFilter = (req, file, cb) => {
  console.log(file, req, "this is the req and file");
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Please Provide an image"), false);
  }
};

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>

const MONGODB_URI =
  "mongodb+srv://Daniel28:Opeoluwa28@cluster1.kt7wh.mongodb.net/messages";

app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Acess-Control-Allow-Methods", "Content-Type, Authorization");
  next();
});

// use to forward any http method
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((result) => {
    app.listen(8080);
    console.log("app has started on port 8080");
  })
  .then(() => console.log("connected"))
  .catch((err) => {
    console.log(err);
  });
