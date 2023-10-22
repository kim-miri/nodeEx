const dotenv = require("dotenv").config();
const router = require("express").Router();

const mongoclient = require("mongodb").MongoClient;
const objId = require("mongodb").ObjectId;
const url = process.env.DB_URL;

let mydb;
mongoclient
  .connect(url)
  .then((client) => {
    mydb = client.db("coffee");
  })
  .catch((err) => {
    console.log(err);
  });

//'/enter' 요청에 대한 처리 루틴
router.get("/enter", (req, res) => {
  res.render("enter.ejs");
});

//'/save' 요청에 대한 post 방식의 처리 루틴
router.post("/save", (req, res) => {
  console.log(req.body.title);
  console.log(req.body.content);
  console.log(req.body.someDate);
  mydb
    .collection("post")
    .insertOne({
      title: req.body.title,
      content: req.body.content,
      date: req.body.someDate,
      path: imagespath,
    })
    .then((result) => {
      console.log(result);
      console.log("데이터 추가 성공");
    });

  res.redirect("/list");
});

// image
let multer = require("multer");
let storage = multer.diskStorage({
  destination: (req, file, done) => {
    done(null, "./public/images");
  },
  filename: (req, file, done) => {
    done(null, file.originalname);
  },
});

let upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
router.get("/upload", function (req, res) {
  res.render("upload.ejs");
});

let imagespath = "";

router.post("/photo", upload.single("picture"), (req, res) => {
  imagespath = "\\" + req.file.path;
});

module.exports = router;
