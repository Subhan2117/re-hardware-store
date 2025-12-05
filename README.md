🛠️ Re Hardware Store

Modern Full-Stack E-Commerce Platform

Next.js 15 • Firebase • Stripe • Tailwind • Shadcn UI

<p align="center"> <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" /> <img src="https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase" /> <img src="https://img.shields.io/badge/Stripe-Payments-626CD9?style=for-the-badge&logo=stripe" /> <img src="https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=for-the-badge&logo=tailwindcss" /> </p>

 📦 Overview
 
Re Hardware Store is a full-stack e-commerce platform built using the Next.js App Router, Firebase backend services, and Stripe Checkout. It features a modern UI, secure authentication, full shopping experience, and an admin dashboard for managing products, orders, and analytics.

## ✨ Features

### 🌐 User Features
- Responsive UI  
- Browse products  
- Product details  
- Add/remove/update cart items  
- Live cart totals  
- Stripe checkout  
- Order confirmation  
- Order tracking  
- Email login  
- Google login  
- Forgot password  

### 🔐 Authentication & Security
- Firebase Authentication  
- Email + Google login  
- Hidden admin login  
- Role-based route protection  
- Secure sessions  

### 🧑‍💼 Admin Dashboard
#### Analytics
- Revenue  
- Customers  
- Products  
- Month-over-month growth  

#### Product Management
- Add products  
- Edit products  
- Delete products  
- Upload images  

#### Order Management
- View all orders  
- Customer details  
- Stripe payment status  
- Timestamps  

## 🧩 Tech Stack
### Frontend
- Next.js 15  
- React  
- Tailwind CSS  
- Shadcn UI  
- Lucide Icons  

### Backend
- Firebase Auth  
- Firestore DB  
- Firebase Storage  
- Firebase Admin SDK  

### Payments
- Stripe Checkout  
- Stripe Webhooks  

### Deployment
- Vercel  
- Firebase  
- Stripe Dashboard  

## 📁 Project Structure
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
/mock-data  
/styles  

## 🔧 Installation & Setup

### 1. Clone the repo
git clone https://github.com/Subhan2117/re-hardware-store  
cd re-hardware-store

### 2. Install dependencies
pnpm install

### 3. Approve Firebase builds
pnpm approve-builds

### 4. Create .env.local
Add Firebase + Stripe environment variables.

### 5. Run server
pnpm dev

## 💳 Stripe Checkout Flow
1. Add items to cart  
2. Create checkout session  
3. Redirect to Stripe  
4. Confirm payment  
5. Save order in Firestore  
6. Track order  

## 🔐 Admin Protection
/admin/* requires user.role === "admin"

## 🧭 Roadmap
- Wishlist  
- Reviews  
- Coupons  
- AI-powered search  
- Dashboard charts  
- Low-stock alerts  
- Notifications  
- React Native app  

## 👨‍💻 Author
Subhan Nadeem  , Gurleen Kaur, Matthew Arcaro, Rosemarie Nasta, James McCormack

## 📄 License
For personal, academic, and portfolio use.
