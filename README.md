🛠️ Re Hardware Store
Modern Full-Stack E-Commerce Platform
Next.js 15 • Firebase • Stripe • Tailwind • Shadcn UI
<p align="center"> <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" /> <img src="https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase" /> <img src="https://img.shields.io/badge/Stripe-Payments-626CD9?style=for-the-badge&logo=stripe" /> <img src="https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=for-the-badge&logo=tailwindcss" /> </p>
📦 Overview
Re Hardware Store is a complete, production-ready e-commerce platform built with Next.js App Router, integrated Firebase backend, and Stripe checkout.
It offers a fast, modern shopping experience for users and a powerful admin panel for managing products, orders, and analytics.
✨ Features
🌐 User Experience
Modern, elegant UI (Tailwind + Shadcn)
Browse and view hardware products
Add/remove/update items in cart
Dynamic cart totals (subtotal, tax, shipping)
Secure Stripe Checkout
Order confirmation & tracking page
Firebase Auth (Email + Google)
Forgot Password flow
Fully responsive on all devices
🔐 Authentication & Security
Firebase Authentication
Email/password login
Google OAuth login
Secure session management
Hidden admin access (admins sign in as normal users)
Role-based route protection (Next.js middleware)
🧑‍💼 Admin Dashboard
Everything an admin needs to run the store:
📊 Analytics Overview
Total revenue
Total customers
Total products
Month-over-month growth card
📦 Inventory Management
Add new products
Edit product details
Upload product images (Firebase Storage)
Delete products
🧾 Order Management
View all customer orders
Shipping & status fields
Payment status (from Stripe webhook)
Customer email & order details
🛠️ Tech Stack
Frontend
Next.js 15 (App Router)
React
Tailwind CSS
Shadcn UI
Lucide Icons
Backend
Firebase Authentication
Firebase Firestore
Firebase Storage
Firebase Admin SDK (for server-side operations)
Payments
Stripe Checkout (latest API)
Secure payment confirmation via webhook (Node runtime)
Deployment
Vercel (Next.js hosting)
Firebase (Auth, Firestore, Storage)
Stripe Dashboard (webhooks + payments)
📁 Directory Structure
/app
  /(public)
    /store
    /cart
    /tracking
    /login
    /forgot-password
  /admin
    /dashboard
    /products
    /orders
  /api
    /stripe
    /firebase
/components
/context
/hooks
/lib
  /firebase
  /stripe
/mock-data
/styles
🔧 Installation & Setup
1️⃣ Clone repository
git clone https://github.com/Subhan2117/re-hardware-store
cd re-hardware-store
2️⃣ Install dependencies
pnpm install
3️⃣ Approve Firebase builds (if required)
pnpm approve-builds
4️⃣ Add environment variables
Create .env.local:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PROJECT_ID=...

STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PUBLIC_KEY=...
5️⃣ Start development server
pnpm dev
💳 Stripe Integration
Checkout Flow
User adds items → Cart Context
API route creates Stripe Checkout Session
Redirect to Stripe hosted checkout
Stripe Webhook → confirms payment
Firestore creates order record
Tracking page shows completed order
Stored Order Data
Customer name + email
Items with IDs and quantities
Totals (subtotal, tax, shipping, total)
Payment status
Timestamp
🔐 Admin Route Protection
Protected using Next.js middleware:
/admin/* → requires role === 'admin'
User logs in normally → role assigned from Firestore → access granted automatically.
Admins are not exposed in UI.
🧭 Roadmap
Upcoming Enhancements
⭐ User wishlist
⭐ Product reviews
⭐ AI-powered search
⭐ Dashboard charts (line graphs, bar charts)
⭐ Discount codes / coupons
⭐ Order status updates with email notifications
⭐ Mobile app (React Native)
📸 Screenshots (Optional Previews)
I can generate a full screenshot section using nice side-by-side GitHub README layout if you want!
👨‍💻 Author
Subhan Nadeem
Full-Stack Developer | Next.js • Firebase • Stripe • AI Engineering
Hofstra University — Computer Science
📄 License
This project is for academic, personal, and professional portfolio use.