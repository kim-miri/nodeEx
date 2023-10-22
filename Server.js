// const dotenv = require("dotenv").config();

const mongoclient = require("mongodb").MongoClient;
const objId = require("mongodb").ObjectId;
const url =
  "mongodb+srv://admin:1234@cluster0.dlxi4ez.mongodb.net/?retryWrites=true&w=majority";

let mydb;
mongoclient
  .connect(url)
  .then((client) => {
    mydb = client.db("coffee");
    app.listen(8080, () => {
      console.log(`포트 8080으로 서버 실행`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const express = require("express");
const { reset } = require("nodemon");
const path = require("path");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// app.use(express.static("public"));
app.use("/public", express.static(path.join(__dirname, "public")));

// post.js 미들웨어 추가. 사용자 요청이 들어오면 해당 경로의 파일을 참조한다는 의미의 미들웨어
app.use("/", require("./routes/post.js"));
app.use("/", require("./routes/add.js"));
app.use("/", require("./routes/auth.js"));

app.get("/coffee", (req, res) => {
  res.send("<h1>coffee page</h2>");
});

// cookie
let cookieParser = require("cookie-parser");
app.use(cookieParser("sdfaedvaaevfdfgdb32523e3"));

app.get("/cookie", (req, res) => {
  let milk = parseInt(req.signedCookies.milk) + 1000;
  if (isNaN(milk)) milk = 0;
  res.cookie("milk", milk, { signed: true });
  res.send(`product : ${milk.toLocaleString()}원`);
});

// /session 요청 라우터 생성
app.get("/session", (req, res) => {
  // req.session.milk 요청시 값이 NaN이면 req.session.milk 값 0으로 설정
  if (isNaN(req.session.milk)) req.session.milk = 0;

  req.session.milk = req.session.milk + 1000;
  // 브라우저에 세션값 전송
  res.send(`session : ${req.session.milk}원`);
});

// 게시물 검색
app.get("/search", (req, res) => {
  console.log(req.query);
  // 특정 단어가 제목에 포함되어 있어도 검색 결과에 포함되게
  const searchValue = req.query.value;
  mydb
    .collection("post")
    // 아래 코드는 완전하게 일치하는 것만 검색
    // .find({ title: req.query.value })
    .find({ title: { $regex: searchValue, $options: "ix" } })
    // 여러 개의 결과를 받을 수 있도록 .toArray()
    .toArray()
    .then((result) => {
      console.log(result);
      res.render("result.ejs", { data: result });
    });
});
