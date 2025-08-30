import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true, ref: "User" }, // Clerk userId (string)
  show: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Show" }, // proper ObjectId
  amount: { type: Number, required: true },
  bookedSeats: { type: [String], required: true }, // better typing, seats like ["A1", "A2"]
  isPaid: { type: Boolean, default: false },
  paymentLink: { type: String },
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
