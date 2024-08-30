import express from 'express';
import cors from 'cors';
import multer from 'multer'
import {v4 as uuidv4} from 'uuid'

const app = express();


app.get('/', (req,res)=>{
    res.json({messasge: "Hello worls"})
})

app.listen(3000, ()=>{
    console.log("App is listening at port 3000...")
})
