import express from 'express';
import cors from 'cors';
import multer from 'multer'
import {v4 as uuidv4} from 'uuid'
import path from 'path';
import fs from 'fs';
import {exec} from 'child_process';   /* have to search about it */
import { stderr, stdout } from 'process';


const app = express();


//multer middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Specify the folder to store files
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + uuidv4() + path.extname(file.originalname)); 
    }
})
//multer configration
const upload = multer({
    storage:storage
})



// Enable CORS for all routes
app.use(cors());

// Alternatively, configure specific CORS options

// const corsOptions = {
//   origin: 'http://example.com', // Replace with your frontend's URL
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true, // Enable this if your frontend needs to send cookies with requests
// };

// app.use(cors(corsOptions));



app.use((req,res,next)=>{
    res.header("Access-Sontrol-Allow-Origin", "*")
    res.header("Access-Sontrol-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept");

    next();
})


app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use("/uploads", express.static('uploads'))


app.get('/', (req,res)=>{
    res.json({messasge: "Hello world"})
})

app.post('/upload', upload.single('file'), (req,res)=>{
    // console.log("File uploaded");
    // res.json({messasge: "File uploaded successfully"})

    const lessonId = uuidv4();
    const videoPath = req.file.path
    const outputPath = `./uploads/courses/${lessonId}`
    const hlsPath = `${outputPath}/index.m3u8`
    console.log("hlsPath", hlsPath);


    if(!fs.existsSync(outputPath)){
        fs.mkdirSync(outputPath, {recursive: true})
    }


    //ffmpeg


    //no queue because of POC, not to be used in production
    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(ffmpegCommand, (err, stdout, stderr)=>{
        if(err){
            console.log(`exec errors: ${err}`);
        }
        console.log(`stdout : ${stdout}`);
        console.log(`stderr : ${stderr}`);

        const videoUrl = `http://localhost:5000/uploads/courses/${lessonId}/index.m3u8`;

        res.json({
            messasge: "Video converted to HLS format",
            videoUrl: videoUrl,
            lessonId: lessonId
        })
    })

})


app.listen(5000, ()=>{
    console.log("App is listening at port 5000...")
})
