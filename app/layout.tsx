import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Study Buddy',
  description: 'Study Buddy is a tool to help you study for exams by generating practice questions.',
  metadataBase: new URL('https://mystudybuddy.vercel.app'),
  openGraph: {
    title: 'Study Buddy',
    description: 'Study Buddy is a tool to help you study for exams by generating practice questions.',
    url: 'https://mystudybuddy.vercel.app/',
    siteName: 'Study Buddy',
    images: [
      {
        url: '/study.webp',
        width: 1200,
        height: 630,
        alt: 'Study Buddy - Your AI-Powered Study Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Buddy',
    description: 'Study Buddy is a tool to help you study for exams by generating practice questions.',
    images: ['/study.webp'],
    creator: '@benjamibono',
  },
};

import { ReactNode } from 'react';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" className="yuqqizjsc idc0_343">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;