import { clerkClient } from '@clerk/express';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

//API Controller Function to get user Bookings
export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth().userId;
        const bookings = await Booking.find({ user }).populate({
            path: 'show',
            populate: { path: 'movie' }
        }).sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//API controller function to update favorite movie in clerk metadata
export const updateFavorite = async (req, res) => {
    try {
        const userId = req.auth().userId;
        const { movieId } = req.body;
        //Add movieId to user's favoriteMovies array
        const user = await clerkClient.users.getUser(userId);
        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        }
        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId);
        } else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId);
        }
        await clerkClient.users.updateUser(userId, { privateMetadata: user.privateMetadata });
        res.json({ success: true, message: "Favorite movies updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//API controller function to get favorite movies from clerk metadata
export const getFavorite = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId);
        const favorites = user.privateMetadata.favorites;

        //getting movies from database
        const movies = await Movie.find({ _id: { $in: favorites } });
        res.json({ success: true, movies });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
