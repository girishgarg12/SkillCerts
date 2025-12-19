import express from 'express'
import { connectDB } from './db/dbconnect.js';
import userRouter from './routes/user.routes.js';



const app = express();

app.use(express.json());
app.use(cors());



connectDB();

const PORT =process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`app is running on http://localhost:3000`);
})