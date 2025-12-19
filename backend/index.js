import express from 'express'
import { connectDB } from './db/dbconnect.js';

const app = express();
connectDB();

const PORT =process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`app is running on http://localhost:3000`);
})