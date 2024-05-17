import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
import { userRouter } from "./routes/user.js";
import multer from 'multer';

const app = express();

//mongoose.connect("mongodb://127.0.0.1:27017/authentication")
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}));
app.use(cookieParser());
app.use("/auth", userRouter);
app.use("/files",express.static('files'));
//app.use("/competitions",express.static('competitions'));

const PORT = process.env.PORT || 5000;
//const MONGO_URL = "mongodb://localhost:27017/authentication";
mongoose.connect("mongodb://localhost:27017/authentication")


app.listen(process.env.PORT, () => {
    console.log("Connected to MongoDB");
    console.log(`Server is running on port ${PORT}`);
});


//Multer: to store files in the server
//const multer = import('multer')
//const upload = multer({ dest: './files' })

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './files')
    },
    filename: function (req, file, cb) { 
      cb(null,file.originalname)
    }
  })

  const storageforCompetition = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './competitions')
    },
    filename: function (req, file, cb) { 
      cb(null,file.originalname)
    }
  });

  const competitionFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if(allowedTypes.includes(file.mimetype)){
      cb(null, true);
    }
    
    else{
        cb(null, false);
      }
  }

//CRUD actions for resources

import("./models/resourcesDetails.js");
const resourcesDetailsSchema = new mongoose.Schema({ 
    title: String,
    file: String,
    description: String,
    uploadedDate: Date,
});

const upload = multer({ storage: storage })
const resourcesSchema = mongoose.model("resourcesDetails", resourcesDetailsSchema);
app.post('/upload-files', upload.single('file'), async(req, res) => {
    //console.log(req.file);
    const title = req.body.title;
    const fileName= req.file.filename;
    //const description = req.body.description;
    const uploadedDate = Date.now();
    //console.log("This is date", uploadedDate);

    try{
        await resourcesSchema.create({ 
            title: title, 
            file: fileName, 
            uploadedDate: Date.now(),
            //description: description
        
        });
        // console.log("File uploaded successfully!");
        // console.log("Description is here", description);
    }catch(err){
        res.status(500).json({error: "Internal Server Error"});
        console.log(err);
    }
})

app.get('/get-files', async(req, res) => {

   try{
    resourcesSchema.find({}).then((data) => {
        res.status(200).json({ status: "Success", data: data});
    });

   }catch(err){
       res.status(500).json({error: "Internal Server Error"});
       console.log(err);
   }
})

app.put('/update-files/:id', async(req, res) => {

    try{
        await resourcesSchema.findByIdAndUpdate({_id: req.body.id}, {title:req.body.title}).exec();
        res.send({success:true, message: "Tile has been updated!"})

    }catch(err){
        res.status(500).json({error: "Internal Server Error"});
        console.log(err);
    }

})

app.delete('/delete-files/:id', async(req, res) => {

    const id = req.params.id;
    //console.log("hello this is id",id);
    try{
        resourcesSchema.findByIdAndDelete(id).exec();
        res.status(200).json({status: "Resources has been deleted!"});
    }catch(err){
        res.status(500).json({error: "Internal Server Error"});
        console.log(err);
    }

})


//CRUD actions for competitions
import("./models/competitionDetails.js");
const CompetitionDetailsSchema = new mongoose.Schema({
    title: String,
    file: String,
    description: String,
    uploadedDate: Date,

});

const uploadCompetition = multer({ storage: storageforCompetition, fileFilter: competitionFilter})
const competitionSchema = mongoose.model("competitionDetails", CompetitionDetailsSchema);
app.post('/upload-competitions', uploadCompetition.single('file'), async(req, res) => {
    //console.log(req.file);
    //const title = req.body.title;
    const fileName= req.file.filename;
    const description = req.body.description;
    const uploadedDate = Date.now();
    //console.log("This is date", uploadedDate);

    try{
        await competitionSchema.create({ 
            //title: title, 
            file: fileName, 
            uploadedDate: Date.now(),
            description: description
        
        });
        // console.log("File uploaded successfully!");
        // console.log("Description is here", description);
    }catch(err){
        res.status(500).json({error: "Internal Server Error"});
        console.log(err);
    }
})

app.get('/get-competitions', async(req, res) => {
    
   try{
    competitionSchema.find({}).then((data) => {
        res.status(200).json({ status: "Success", data: data});
    });

   }catch(err){
       res.status(500).json({error: "Internal Server Error"});
       console.log(err);
   }
})

app.put('/update-competitions/:id', async(req, res) => {
    try{
        // const id = req.params.id;
        // const title = req.body.title;
        // const description = req.body.description;
        //console.log("hello", req.body);
        await competitionSchema.findByIdAndUpdate({_id: req.body.id}, {description:req.body.description}).exec();
        res.send({success:true, message: "Description has been updated!"})

    }catch(err){
        res.status(500).json({error: "Internal Server Error"});
        console.log(err);
    }
})

app.delete('/delete-competitions/:id', async(req, res) => {
    const id = req.params.id;
    //console.log("hello this is id",id);
    try{
        competitionSchema.findByIdAndDelete(id).exec();
        res.status(200).json({status: "Competition has been deleted!"});
    }catch(err){
        res.status(500).json({error: "Internal Server Error"});
        console.log(err);
    }
})

// Path: app.js
import ("./userDetails.js");

const userDetailsSchema = new mongoose.Schema({ 
    userName: String,
    email: String,
    password: String,
});

const User = mongoose.model("usersDetails", userDetailsSchema);

app.post("/signup", async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        await User.create({ 
            userName: userName, 
            email: email, 
            password: password 
        });
        res.status(200).json({ status: "Registered" });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
    }
});

// Path for lecturers 
import ("./models/Lecturers.js");

const LecturersDetailsSchema = new mongoose.Schema({
    userName: String,
    email: String,
    password: String,
    role: String,
});

const Lecturers = mongoose.model("lecturersDetails", LecturersDetailsSchema);

app.post("/register-as-Lecturers", async (req, res) => {

    const { userName, email, password } = req.body;

    try {
        await Lecturers.create({ 
            userName: userName, 
            email: email, 
            password: password,
            role: "Lecturers" 
        });
        res.status(200).json({ status: "Registered" });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
    }
});

// Visits counter
import("./models/visits.js");
const visitsSchema = new mongoose.Schema({ 
    count: Number,
});