const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer"); // for upload file

const app = express();
var fs = require("fs");
var path = require("path");
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(cors());

// connect to serveur
mongoose.connect("mongodb://localhost:27017/contactDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const contactSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  phone: Number,
  gender: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Contact = mongoose.model("contact", contactSchema);

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.originalname}`);
  },
});
var upload = multer({ storage: storage });
app.post("/add", upload.single("file"), (req, res) => {
  let picture = req.file.filename;
  const pic = `${picture}`;
  const contact = new Contact({
    firstname: req.body.firstName,
    lastname: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender,
    img: {
      data: fs.readFileSync(path.join(__dirname + "/uploads/" + pic)),
      contentType: "image",
    },
  });
  contact.save();
  fs.unlinkSync(path.join(__dirname + "/uploads/" + pic));
});
app.get("/list", (req, res) => {
  Contact.find({}, (err, list) => {
    if (err) {
      res.json(err);
    } else {
      res.json(list);
    }
  });
});
app.get("/contact/:id", (req, res) => {
  let contactId = req.params.id;
  Contact.findOne({ _id: contactId }, (err, contact) => {
    if (err) {
      res.send(err);
    } else {
      res.send(contact);
    }
  });
});

app.put("/contact/:id", upload.single("file"), (req, res) => {
  console.log(req.file);
  let contactId = req.params.id;
  let picture = req.file.filename;

  const updatePic = `${picture}`;
  Contact.updateOne(
    { _id: contactId },
    {
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,
      img: {
        data: fs.readFileSync(path.join(__dirname + "/uploads/" + updatePic)),
        contentType: "image",
      },
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("you succesfuly updated the doc");
      }
    }
  );
  fs.unlinkSync(path.join(__dirname + "/uploads/" + updatePic));
});

app.listen(3000, () => {
  console.log("server work");
});
