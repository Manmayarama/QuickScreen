import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { model } from "mongoose";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//Inngest function to save user data to database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData);
    }
)

//Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data;
        await User.findByIdAndDelete(id);
    }
)

//Inngest Function to update user in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData);
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
            const waitUntil = new Date(Date.now() + 2 * 60 * 1000); // wait 2 min
            await step.sleepUntil(`wait-${i}`, waitUntil);

            const booking = await Booking.findById(bookingId);
            if (!booking) {
                console.log("❌ Booking not found, stopping loop.");
                return;
            }

            if (booking.isPaid) {
                console.log(`✅ Booking ${bookingId} is already paid. Stopping checks.`);
                return; // stop loop once paid
            }
        }

        // Final check after 10 minutes → cancel only if still unpaid
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
        const show = await Show.findById(booking.show);

        if (!booking || !booking.isPaid) {
            console.log("❌ No valid paid booking found.");
            return;
        }

        const user = await User.findById(booking.user);
        if (!user?.email) {
            console.log("❌ User not found or no email.");
            return;
        }

        function formatShowTime(date) {
            return new Date(date).toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",  // ✅ Ensure IST
                weekday: "short",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }).replace(",", " at");
        }
        const showTime = formatShowTime(booking.show.showDateTime);

        const htmlBody = `
    <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden;">
        <div style="background:#4CAF50; color:#fff; padding:20px; text-align:center;">
          <h2 style="margin:0;">🎉 Booking Confirmed!</h2>
        </div>
        
        <div style="padding:20px;">
          <p style="font-size:16px;">Hello <b>${user.name}</b>,</p>
          <p style="font-size:16px; color:#333;">
            ✅ Your booking has been confirmed for:
          </p>
          
          <div style="border:1px solid #ddd; border-radius:8px; padding:15px; margin:15px 0; background:#fafafa;">
            <h3 style="margin:0; color:#333;">${booking.show.movie.title}</h3>
            <p style="margin:5px 0; font-size:14px; color:#555;">Seats: <b>${booking.bookedSeats.join(", ")}</b></p>
            <p style="margin:5px 0; font-size:14px; color:#555;">Showtime: <b>${showTime}</b></p>
            <p style="margin:5px 0; font-size:14px; color:#555;">Amount Paid: <b>₹${booking.amount}</b></p>
          </div>

          <p style="font-size:14px; color:#777;">Please arrive at the theatre 15 minutes before the showtime.</p>
        </div>
        
        <div style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#555;">
          🎬 Movie Ticket Booking System<br/>
          This is an automated email — please do not reply.
        </div>
      </div>
    </div>
    `;

        await sendEmail({
            to: user.email,
            subject: `🎟️ Booking Confirmed - ${booking.show.movie.title}`,
            body: htmlBody,
        });

        console.log(`✅ Confirmation email sent to ${user.email}`);
    }
);

//Notification when new show added
const sendNewShowEmail = inngest.createFunction(
  { id: "send-new-show-email" },
  { event: "app/show.added" },
  async ({ event }) => {
    const { movieTitle } = event.data;

    const show = await Show.findById(event.data.showId).populate("movie");
    if (!show) {
      console.log("❌ Show not found");
      return;
    }

    // format IST showtime
    function formatShowTime(date) {
      return new Date(date).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).replace(",", " at");
    }
    const showTime = formatShowTime(show.showDateTime);

    // Get all users to notify
    const users = await User.find({});
    if (!users.length) {
      console.log("⚠️ No users found to notify.");
      return;
    }

    for (const user of users) {
      if (!user.email) continue;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden;">
            <div style="background:#2196F3; color:#fff; padding:20px; text-align:center;">
              <h2 style="margin:0;">🍿 New Show Added!</h2>
            </div>
            
            <div style="padding:20px;">
              <p style="font-size:16px;">Hello <b>${user.name}</b>,</p>
              <p style="font-size:16px; color:#333;">
                A new show has been added:
              </p>
              
              <div style="border:1px solid #ddd; border-radius:8px; padding:15px; margin:15px 0; background:#fafafa;">
                <h3 style="margin:0; color:#333;">${movieTitle}</h3>
                <p style="margin:5px 0; font-size:14px; color:#555;">Showtime: <b>${showTime}</b></p>
                <p style="margin:5px 0; font-size:14px; color:#555;">Ticket Price: <b>₹${show.showPrice}</b></p>
              </div>

              <p style="font-size:14px; color:#777;">Hurry up and book your seats before they’re gone!</p>
            </div>
            
            <div style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#555;">
              🎬 Movie Ticket Booking System<br/>
              This is an automated email — please do not reply.
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: `🍿 New Show Added - ${movieTitle || "Movie"}`,
        body: htmlBody,
      });

      console.log(`📩 New show email sent to ${user.email}`);
    }
  }
);


// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail, sendNewShowEmail];
