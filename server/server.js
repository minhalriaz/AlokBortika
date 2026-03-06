import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./src/config/mongodb.js";
<<<<<<< HEAD
import authRouter from "./src/modules/auth/auth.routes.js";
import donationRouter from "./src/modules/donation/donation.routes.js";
=======
import authRouter from "./src/modules/auth/auth.routes.js"
>>>>>>> ec66770f18ea78210c34f472dcc5c1e9de4869e6

const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true 
}));
//API Endpoints
app.get("/", (req, res) => res.send("API Working"));
<<<<<<< HEAD
app.use("/api/auth", authRouter);
app.use("/api/donations", donationRouter);
=======
app.use('/api/auth',authRouter)
>>>>>>> ec66770f18ea78210c34f472dcc5c1e9de4869e6

app.listen(port, () => console.log(`Server started on PORT: ${port}`));
