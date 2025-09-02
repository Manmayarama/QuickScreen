# <img src="https://github.com/Manmayarama/QuickScreen/blob/main/client/public/favicon.svg" alt="Logo" width="24" style="vertical-align: middle;"/>  QuickScreen  

Welcome to **QuickScreen** — a modern **Movie Ticket Booking System**!  
Built with **React**, **Express**, **MongoDB**, and integrated with **Clerk, Stripe & Inngest** for a seamless booking experience. 🍿🎟️  

---

## 🌟 Features

- 🔐 **User Authentication** with [Clerk](https://clerk.com)  
- 🎥 **Browse Movies & Shows** (fetched from TMDB API)  
- 🪑 **Real-Time Seat Booking** with instant updates  
- 💳 **Secure Payments** powered by [Stripe](https://stripe.com)  
- 📧 **Email Notifications** (Booking confirmations, new show alerts)  
- 🕑 **Auto Seat Release** if payment isn’t completed within 10 minutes using Inngest  
- ⚡ **Inngest Workflows** for background tasks & scheduling (payment checks, seat release)  
- 🎨 **Beautiful UI** built with React + Tailwind  

---

## 🕹️ How It Works

1. **Sign Up / Log In** → Securely authenticate with Clerk  
2. **Choose a Movie** → Browse upcoming shows from TMDB  
3. **Book Seats** → Select your seats in real-time  
4. **Pay with Stripe** → Instant and secure checkout  
5. **Get Confirmation** → Receive an email ticket instantly  
6. **New Show Alerts** → Get notified when show is added 

---

## 🧠 Tech Stack

| Layer         | Tech                               |
|---------------|------------------------------------|
| Frontend      | React (Vite), TailwindCSS, Clerk   |
| Backend       | Node.js, Express                   |
| Database      | MongoDB + Mongoose                 |
| Auth          | Clerk                              |
| Payments      | Stripe                             |
| Emails        | Nodemailer (Gmail)                 |
| Workflows     | Inngest                            |
| Movie Data    | TMDB API                           |
| Hosting       | Vercel / Render                    |

---

## ⚙️ Requirements

- **Node.js** v16+  
- **npm** or **yarn**  
- **MongoDB Atlas** connection string  
- **Clerk API Keys** (frontend & backend)  
- **Stripe API Keys**  
- **Inngest API Keys**  
- **TMDB API Key**  

---

## 🛠️ Setup Instructions

To get QuickScreen up and running on your local machine, follow these steps:

### 📥 Clone the repo

```bash
git clone https://github.com/Manmayarama/QuickScreen.git
cd QuickScreen
```

## 📦 Install Dependencies

Navigate into the `client` and `server` directories to install their respective dependencies:

```bash
cd client && npm install      # Install frontend dependencies
cd server && npm install      # Install backend dependencies
```

## 🔐 .env Configuration

Create a `.env` file in the root of your **server** directory and add the following:

```env
MONGODB_URI="your_mongodb_connection_string"
CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
INNGEST_EVENT_KEY="your_inngest_event_key"
INNGEST_SIGNING_KEY="your_inngest_signing_key"
TMDB_API_KEY="your_tmdb_api_key"
SENDER_EMAIL="your_gmail_or_smtp_email"
SENDER_PASS="your_app_password"
```

Create a `.env` file in the root of your **client** directory and add the following:

```env
VITE_CURRENCY='₹'
VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
VITE_BASE_URL="http://localhost:3000 || server_hosted_url "
VITE_TMDB_IMAGE_BASE_URL="https://image.tmdb.org/t/p/original"
VITE_TMDB_API_KEY="your_tmdb_api_key"
```

## 🚀 Running the Application

### 🗄️ Start the Backend

From the `server` directory:

```bash
npm run server
```
### 📱 Start the Frontend

From the `client` directory:

```bash
npm run dev
```
---

## 🛡️ Admin Access  

QuickScreen comes with a **secure Admin Panel** at:  

🔗 `https://your-domain.com/admin`  

### 🔐 Access Control  

- Admin access is managed through **Clerk Private Metadata**  
- A user must have the following metadata in their Clerk profile for accessing it.
- Only users with "role": "admin" can view and manage the /admin page.

```json
{
  "role": "admin"
}
```
---

## 🛡️ Admin Capabilities  

The **Admin Panel** (`/admin`) provides powerful tools for managing the booking system.  

### ✨ Features  

- 🎬 **Add New Shows**  
  Admins can create new shows by selecting a movie, setting the date & time, and defining the ticket price.  

- 🎟️ **Track Bookings**  
  View the total number of bookings made per show and monitor seat occupancy.  

- 📊 **Active Shows Overview**  
  Get a quick snapshot of all currently running and upcoming shows.  

- 💰 **Earnings Dashboard**  
  Instantly calculate and view total earnings generated from ticket sales.  

---
## 📥 Try It

Try the live version:  
🔗 https://quickscreen-nu.vercel.app/

---
