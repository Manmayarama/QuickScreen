import express from "express";
import { getUserBookings,getFavorite,updateFavorite } from "../controllers/userController.js";
import e from "express";

const userRouter=express.Router();

//API endpoints for user
userRouter.get("/bookings",getUserBookings);
userRouter.post("/update-favorites",updateFavorite);
userRouter.get("/favorites",getFavorite);

export default userRouter;
