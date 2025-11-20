import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/api/login/context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Analytics } from '@vercel/analytics/next';
import Navbar from './component/Navbar';
import { ToastProvider } from './hooks/useToast';
import BuildCraftAssistant from './component/Chat.jsx';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Re-Hardware',
  description: 'Family Friendly Hardware Store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              {children}
              <BuildCraftAssistant />
            </ToastProvider>
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
