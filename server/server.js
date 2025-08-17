import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import {clerkMiddleware} from '@clerk/express'
import { use } from 'react';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();
const port = 3000;

//DB connection
await connectDB();

//middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

//API routes
app.get('/', (req, res) => {res.send('Server is running!');});
app.use('/api/inngest', serve({ client: inngest, functions }));//api route for inngest

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
