import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EdFoal - Premium Dashboard',
  description: 'Sales automation dashboard with project tracking and reporting.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#f1f5f9] text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
