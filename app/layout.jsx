import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/api/login/context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Analytics } from '@vercel/analytics/next';

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
            {children}
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
