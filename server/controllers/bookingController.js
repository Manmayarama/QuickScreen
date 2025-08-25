import Booking from "../models/Booking.js";
import Show from "../models/Shows.js";
import stripe from 'stripe';

//Function to check seat availability
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
        const showData=await Show.findById(showId);
        if(!showData) return false;
        const occupiedSeats=showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        return !isAnySeatTaken;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

//Function to create a booking
export const createBooking = async (req, res) => {
  try{
    const {userId} = req.auth();
    const {showId,selectedSeats} = req.body;
    const {origin}=req.headers;

    //check if seat is available for selected show
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if(!isAvailable){
        return res.json({success:false,message:'Selected seats are already booked'});
    }

    //Get the show details
    const showData = await Show.findById(showId).populate('movie');

    //create a new booking
    const booking=await Booking.create({
      user:userId,
      show: showId,
      amount:showData.showPrice*selectedSeats.length,
      bookedSeats: selectedSeats
    });

    selectedSeats.map((seat)=>{
        showData.occupiedSeats[seat]=userId;
    })

    showData.markModified('occupiedSeats');
    //saving to database
    await showData.save();

    //Stripe gateway
    const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY);
    //Creating line items for stripe
    const line_items=[{
      price_data: {
        currency: 'INR',
        product_data: {
          name: `Booking for ${showData.movie.title}`,
        },
        unit_amount: Math.floor(booking.amount) * 100,
      },
      quantity: 1
    }]

    const session=await stripeInstance.checkout.sessions.create({
    
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items:line_items,
      mode:'payment',
      metadata:{
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    booking.paymentLink = session.url; //the session will return a url is stored in booking.paymentLink
    await booking.save(); //update in database

    res.json({success:true,url:session.url}); //return the url to frontend
  } catch (error) {
    console.error(error.message);
    res.json({success:false,message:error.message});
  }
};


//Function to get occupied seats
export const getOccupiedSeats=async(req,res)=>{
    try{
        const {showId}=req.params;
        const showData=await Show.findById(showId);
        if(!showData) return res.json({success:false,message:'Show not found'});
        const occupiedSeats=Object.keys(showData.occupiedSeats);
        res.json({success:true,occupiedSeats});
    } catch (error) {
    console.error(error.message);
    res.json({success:false,message:error.message});
  }
};
