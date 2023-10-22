const router = require("express").Router();

const mongoclient = require("mongodb").MongoClient;
const objId = require("mongodb").ObjectId;
const url =
  "mongodb+srv://admin:1234@cluster0.dlxi4ez.mongodb.net/?retryWrites=true&w=majority";

let mydb;
mongoclient
  .connect(url)
  .then((client) => {
    mydb = client.db("coffee");
  })
  .catch((err) => {
    console.log(err);
  });
// list
router.get("/list", (req, res) => {
  mydb
    .collection("post")
    .find()
    .toArray()
    .then((result) => {
      console.log(result);

      res.render("list.ejs", { data: result });
    });
});
// del
router.post("/delete", (req, res) => {
  console.log(req.body._id);
  req.body._id = new objId(req.body._id);
  mydb
    .collection("post")
    .deleteOne(req.body)
    .then((result) => {
      console.log("삭제 완료");
      res.status(200).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

router.get("/content/:id", (req, res) => {
  console.log(req.params.id);
  req.params.id = new objId(req.params.id);
  mydb
    .collection("post")
    .findOne({ _id: req.params.id })
    .then((result) => {
      console.log(result);
      res.render("content.ejs", { data: result });
    });
});

router.get("/edit/:id", (req, res) => {
  req.params.id = new objId(req.params.id);
  mydb
    .collection("post")
    .findOne({ _id: req.params.id })
    .then((result) => {
      console.log(req.params.id);
      res.render("edit.ejs", { data: result });
    });
});

router.post("/edit", (req, res) => {
  console.log(req.body);
  req.body.id = new objId(req.body.id);
  mydb
    .collection("post")
    .updateOne(
      { _id: req.body.id },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          date: req.body.someDate,
        },
      }
    )
    .then((result) => {
      console.log("수정완료");
      res.redirect("/list");
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
// module.exports로 처리하는 이유
// post.js는 기존 server.js 파일의 일부 기능을 떼어낸 모듈이므로 내부에서 처리하고 해당 결과를 외부에 노출 시켜줘야 동작 됨.
