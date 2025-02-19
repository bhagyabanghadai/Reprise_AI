import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Reprise Fitness - AI-Powered Workout Platform',
  description: 'Transform your fitness journey with AI-powered workout analysis, personalized recommendations, and intelligent training experiences.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}