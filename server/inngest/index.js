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
        const {id,first_name,last_name,email_address,image_url} = event.data;
        const userData={
            _id:id,
            email:email_address[0].email_address,
            name:first_name+''+last_name,
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

    // Always wait 10 minutes before deciding
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.log("⚠️ Booking not found:", bookingId);
        return;
      }

      if (booking.isPaid) {
        console.log("✅ Booking paid within 10 minutes, keeping seats.");
        return;
      }

      // Not paid → release seats + delete booking
      const show = await Show.findById(booking.show);
      booking.bookedSeats.forEach((seat) => {
        delete show.occupiedSeats[seat];
      });

      show.markModified("occupiedSeats");
      await show.save();

      await Booking.findByIdAndDelete(booking._id);

      console.log("❌ Booking cancelled due to no payment.");
    });
  }
);


//Inngest function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event, step }) => {
    try {
      const { bookingId } = event.data;

      // Debug incoming event
      console.log("📥 Incoming bookingId from event:", bookingId);

      // 1. Load booking + show + movie
      const booking = await Booking.findById(bookingId).populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      });

      if (!booking) {
        console.error("❌ Booking not found for ID:", bookingId);
        return { success: false, reason: "Booking not found" };
      }

      console.log("✅ Booking loaded:", booking._id.toString());

      // 2. Load user explicitly (since booking.user is a Clerk string ID)
      const user = await User.findById(booking.user);

      if (!user) {
        console.error("❌ User not found for booking.user:", booking.user);
        return { success: false, reason: "User not found" };
      }

      if (!user.email) {
        console.error("❌ User has no email:", user);
        return { success: false, reason: "User has no email" };
      }

      console.log("📧 Sending booking confirmation to:", user.email);

      // 3. Send email
      await sendEmail({
        to: user.email.trim(),
        subject: `🎟️ Booking Confirmation - ${booking.show.movie.title}`,
        body: `
          <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background: #4CAF50; padding: 20px; text-align: center; color: white;">
                <h1 style="margin: 0;">🎉 Booking Confirmed!</h1>
              </div>
              
              <!-- Body -->
              <div style="padding: 20px;">
                <p style="font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                <p style="font-size: 15px;">Your movie booking is confirmed:</p>
                <ul style="list-style: none; padding: 0; font-size: 15px; line-height: 1.6;">
                  <li><strong>🎬 Movie:</strong> ${booking.show.movie.title}</li>
                  <li><strong>🕒 Showtime:</strong> ${new Date(booking.show.showDateTime).toLocaleString()}</li>
                  <li><strong>💺 Seats:</strong> ${booking.bookedSeats.join(", ")}</li>
                  <li><strong>💰 Amount:</strong> ₹${booking.amount}</li>
                </ul>
                <p style="margin-top: 20px;">🍿 Enjoy your movie with <strong>QuickScreen</strong>!</p>
              </div>

              <!-- Footer -->
              <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666;">
                <p style="margin: 0;">© ${new Date().getFullYear()} QuickScreen. All rights reserved.</p>
              </div>
            </div>
          </div>
        `,
      });

      console.log(`✅ Confirmation email sent to ${user.email}`);
      return { success: true };
    } catch (err) {
      console.error("❌ Error sending booking confirmation:", err);
      return { success: false, error: err.message };
    }
  }
);


// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation,syncUserDeletion,syncUserUpdation,releaseSeatsAndDeleteBooking,sendBookingConfirmationEmail];
