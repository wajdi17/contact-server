const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer"); // for upload file

const app = express();
var fs = require("fs");
var path = require("path");
app.use(bodyParser.json());
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
  img: 
    { 
        data: Buffer, 
        contentType: String 
    } 
});

const Contact = mongoose.model("contact", contactSchema);
var i = 1 ;
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `${i}_${file.originalname}`);
  },
});

var  upload = multer({ storage: storage })
app.post("/images",upload.single("file"),(req,res)=>{

})

app.post("/add", (req, res) => {
  let picture = req.body.profilePicName
 const pic = `${i}_${picture}`
 i+= 1
   const contact =new Contact( {
    firstname: req.body.firstName,
    lastname: req.body.lastName,
    email: req.body.email,
    phone:req.body.phone,
    gender: req.body.gender,
    img: { 
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + pic)), 
      contentType: 'image'
  } 
  }) 
  Contact.insertMany([contact], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("done......");
    }
  });
  

});
app.get("/list", (req, res) => {
  Contact.find({}, (err, list) => {
    if (err) {
      res.send(err);
    } else {
      res.send(list);
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

app.put("/contact/:id", (req, res) => {
  let contactId = req.params.id;
  let picture = req.body.profilePicName
 const updatePic = `${i}_${picture}`
 i+= 1
  Contact.updateOne(
    { _id: contactId },
    {
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender ,
      img: { 
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + updatePic)), 
        contentType: 'image'
    } 
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("you succesfuly updated the doc");
      }
    }
  );
});


app.listen(3000, () => {
  console.log("server work");
});
