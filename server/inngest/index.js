import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { model } from "mongoose";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//Inngest function to save user data to database
const syncUserCreation=inngest.createFunction(
    {id:'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event}) => {
        const {id,first_name,last_name,email_addresses,image_url} = event.data;
        const userData={
            _id:id,
            email:email_addresses[0].email_address,
            name:first_name+' '+last_name,
            image:image_url
        }
        await User.create(userData);
    }
)

//Inngest Function to delete user from database
const syncUserDeletion=inngest.createFunction(
    {id:'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const {id} = event.data;
        await User.findByIdAndDelete(id);
    }
)

//Inngest Function to update user in database
const syncUserUpdation=inngest.createFunction(
    {id:'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const {id,first_name,last_name,email_addresses,image_url} = event.data;
        const userData={
            _id:id,
            email:email_addresses[0].email_address,
            name:first_name+' '+last_name,
            image:image_url
        }
        await User.findByIdAndUpdate(id,userData);
    }
)

//Inngest function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made.
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-and-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const bookingId = event.data.bookingId;

    // Repeat check every 2 minutes for up to 10 minutes
    for (let i = 0; i < 5; i++) {
      const waitUntil = new Date(Date.now() + 2 * 60 * 1000); // 2 min
      await step.sleepUntil(`wait-${i}`, waitUntil);

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.log("❌ Booking not found, stopping loop.");
        return;
      }

      if (booking.isPaid) {
        console.log(`✅ Booking ${bookingId} paid. Stopping early.`);
        return; // exit early if paid
      }
    }

    // After 10 minutes and still not paid → cancel
    const booking = await Booking.findById(bookingId);
    if (booking && !booking.isPaid) {
      const show = await Show.findById(booking.show);
      booking.bookedSeats.forEach(seat => delete show.occupiedSeats[seat]);
      show.markModified("occupiedSeats");
      await show.save();
      await Booking.findByIdAndDelete(booking._id);

      console.log(`❌ Booking ${bookingId} cancelled after 10 minutes (no payment).`);
    }
  }
);

//Inngest function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/payment.success" },
  async ({ event }) => {
    const booking = await Booking.findById(event.data.bookingId).populate({
      path: "show",
      populate: { path: "movie", model: "Movie" },
    });

    if (!booking || !booking.isPaid) {
      console.log("❌ No valid paid booking found.");
      return;
    }

    const user = await User.findById(booking.user);
    if (!user?.email) {
      console.log("❌ User not found or no email.");
      return;
    }

    await sendEmail({
      to: user.email,
      subject: `🎟️ Booking Confirmed - ${booking.show.movie.title}`,
      body: `
        Hello ${user.name},<br/>
        ✅ Your booking is confirmed for ${booking.show.movie.title}.<br/>
        Seats: ${booking.bookedSeats.join(", ")}<br/>
        Showtime: ${new Date(booking.show.showDateTime).toLocaleString()}<br/>
      `,
    });

    console.log(`✅ Confirmation email sent to ${user.email}`);
  }
);



// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation,syncUserDeletion,syncUserUpdation,releaseSeatsAndDeleteBooking,sendBookingConfirmationEmail];
