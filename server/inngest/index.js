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
    const booking = await Booking.findById(bookingId);

    // If already paid, stop immediately
    if (!booking || booking.isPaid) {
      console.log("✅ Payment already completed, skipping cancellation.");
      return;
    }

    // Otherwise wait 10 min and re-check
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingAfterWait = await Booking.findById(bookingId);
      if (bookingAfterWait && !bookingAfterWait.isPaid) {
        const show = await Show.findById(bookingAfterWait.show);

        bookingAfterWait.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });

        show.markModified("occupiedSeats");
        await show.save();

        await Booking.findByIdAndDelete(bookingAfterWait._id);

        console.log("❌ Booking cancelled due to no payment.");
      }
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

      // 1. Load booking + show + movie
      const booking = await Booking.findById(bookingId).populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      });

      if (!booking) {
        console.error("❌ Booking not found:", bookingId);
        return { success: false, reason: "Booking not found" };
      }

      // 2. Load user explicitly (because booking.user is a Clerk string ID, not an ObjectId ref)
      const user = await User.findById(booking.user);
      if (!user || !user.email) {
        console.error("❌ User not found or missing email:", booking.user);
        return { success: false, reason: "User not found or no email" };
      }

      // Debug log
      console.log("📧 Sending booking confirmation to:", user.email);

      // 3. Send email
      await sendEmail({
        to: user.email.trim(), // prevent trailing commas/spaces
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
