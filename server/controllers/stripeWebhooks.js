import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

export const stripeWebhooks = async(req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20", // always specify apiVersion
});
  const sig = req.headers["stripe-signature"];
  let event;
  try{
    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }catch(err){
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try{
    switch(event.type){
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const sessionList=await stripeInstance.checkout.sessions.list({
              payment_intent: paymentIntent.id
            });
            const session=sessionList.data[0];
            const {bookingId}=session.metadata;
            await Booking.findByIdAndUpdate(bookingId, {isPaid: true,paymentLink:""});
            //send confirmation email
            await inngest.send({
  name: "app/payment.success",
  data: { bookingId }
});
            break;
        }
        default:
          return res.status(400).send(`Unhandled event type: ${event.type}`);
    }
    res.json({received:true});
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
