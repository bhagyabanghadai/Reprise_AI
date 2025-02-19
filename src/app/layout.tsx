// src/app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import "@/styles/globals.css";


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Your App Title',
  description: 'Your App Description',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"> {/* This is required */}
      <body className={inter.className}> {/* This is required */}
        {children}
      </body>
    </html>
  );
}
