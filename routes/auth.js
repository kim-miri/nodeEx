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

// SHA 알고리즘
const sha = require("sha256");
let session = require("express-session");
router.use(
  session({
    secret: "dfgcsdga234254fsdcs0sdfs12",
    resave: false,
    saveUninitialized: true,
  })
);
// login
router.get("/login", (req, res) => {
  console.log(req.session);

  if (req.session.user) {
    console.log("세션 유지");
    // res.send("로그인 되었습니다.");
    // == 세션이 이미 등록되어 있다면 홈화면으로 이동. 이 때 이 페이지에 {}값 넘겨줌
    res.render("index.ejs", { user: req.session.user });
  } else {
    console.log("로그인 페이지");
    res.render("login.ejs");
  }
});

router.get("/", (req, res) => {
  // res.render("index.ejs");
  if (req.session.user) {
    console.log("세션 유지");
    //res.send('로그인 되었습니다.');
    res.render("index.ejs", { user: req.session.user });
  } else {
    console.log("user : null");
    res.render("index.ejs", { user: null });
  }
});

router.post("/login", (req, res) => {
  console.log(`id: ${req.body.userId}`);
  console.log(`pw: ${req.body.userPw}`);
  // res.send("로그인 되었습니다"); 이미 응답을 보낸 후에 다시 응답 헤더를 설정하려하기 때문에 오류 발생. 주석 처리 필요

  mydb
    .collection("account")
    .findOne({ userId: req.body.userId })
    .then((result) => {
      if (!result) {
        // 사용자를 찾지 못한 경우
        res.render("login.ejs", { error: "사용자를 찾을 수 없습니다" });
        // 암호화된 해시값의 비번 때문에 sha(req.body.userPw)으로 변경
      } else if (result.userPw && result.userPw == sha(req.body.userPw)) {
        // 비밀번호가 일치하는 경우
        req.session.user = req.body;
        console.log("새로운 로그인");
        // res.send("로그인 되었습니다");
        // 이 구문이 login.ejs의 user 변수 전달
        res.render("index.ejs", { user: req.session.user });
      } else {
        // res.send("비밀번호가 틀렸습니다");
        res.render("login.ejs", { error: "비밀번호가 틀렸습니다" });
      }
    });
});

// logout
router.get("/logout", (req, res) => {
  console.log("로그아웃");
  // 현재 도메인의 세션 삭제
  req.session.destroy();
  // res.redirect("/");
  // 로그아웃에 성공했을 때 user에 null 넘김
  res.render("index.ejs", { user: null });
});

// 회원가입
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", (req, res) => {
  console.log(req.body.userId);
  console.log(req.body.userPw);
  console.log(req.body.userGroup);
  console.log(req.body.userEmail);

  mydb
    .collection("account")
    .insertOne({
      userId: req.body.userId,
      // userPw: req.body.userPw,
      // 암호화된 해시값으로 저장됨
      userPw: sha(req.body.userPw),
      userGroup: req.body.userGroup,
      useruserEmail: req.body.userEmail,
    })
    .then((result) => {
      console.log("회원가입 성공");
    });
  res.redirect("/");
});
module.exports = router;
