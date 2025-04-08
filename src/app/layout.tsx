import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InvoSync',
  description: 'Modern Invoice Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <Link href="/" className="flex items-center">
                      <span className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">InvoSync</span>
                    </Link>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/" 
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Home
                    </Link>
                    <Link 
                      href="/invoices" 
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Invoices
                    </Link>
                    <Link 
                      href="/clients" 
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Clients
                    </Link>
                    <DarkModeToggle />
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-grow container mx-auto py-6">
              {children}
            </main>
            <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} InvoSync. All rights reserved.
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 