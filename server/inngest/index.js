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
const releaseSeatsAndDeleteBooking=inngest.createFunction(
    {id:'release-seats-and-delete-booking'},
    {event: 'app/checkpayment'},
    async ({event,step}) => {
        const tenMinutesLater=new Date(Date.now()+10*60*1000);
        await step.sleepUntil('wait-for-10-minutes',tenMinutesLater);
        await step.run('check-payment-status',async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);

            //If payment is not made
            if (!booking || booking.isPaid) {
                const show=await Show.findById(booking.show);
                booking.bookedSeats.forEach((seat)=>{
                    delete show.occupiedSeats[seat];
                });
                // Release seats
                show.markModified('occupiedSeats');
                await show.save();
                // Delete booking
                await Booking.findByIdAndDelete(booking._id);
            }
        });
    }
)

//Inngest function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    { id: 'send-booking-confirmation-email' },
    { event: 'app/show.booked' },
    async ({ event,step }) => {
        const { bookingId } = event.data;
        const booking = await Booking.findById(bookingId).populate({
            path:'show',
            populate:{
                path:'movie',
                model: 'Movie'
            }
        }).populate('user');
        
        await sendEmail({
            to: booking.user.email,
            subject: `Booking Confirmation - ${booking.show.movie.title}`,
            body: `
  <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: #4CAF50; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">🎉 Booking Confirmed!</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: 20px;">
        <p style="font-size: 16px;">Hello <strong>${booking.user.name}</strong>,</p>
        <p style="font-size: 16px;">Thank you for booking with <strong>QuickScreen</strong>. Your movie tickets are confirmed! 🍿</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>🎬 Movie</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${booking.show.movie.title}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>🕒 Showtime</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(booking.show.showDateTime).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>💺 Seats</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${booking.bookedSeats.join(", ")}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>💰 Amount</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">₹${booking.amount}</td>
          </tr>
        </table>
        
        <p style="font-size: 16px; margin-top: 20px;">Enjoy your movie and have a great time! 🎥✨</p>
      </div>
      
      <!-- Footer -->
      <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 14px; color: #555;">
        <p style="margin: 0;">© ${new Date().getFullYear()} QuickScreen. All rights reserved.</p>
      </div>
    </div>
  </div>
`

        })
    }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation,syncUserDeletion,syncUserUpdation,releaseSeatsAndDeleteBooking,sendBookingConfirmationEmail];
