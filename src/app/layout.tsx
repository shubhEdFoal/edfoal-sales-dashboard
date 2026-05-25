import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EdFoal — Sales Automation Dashboard',
  description: 'Phase 1 · Sales Engine · Sales Automation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-bg-base antialiased">{children}</body>
    </html>
  );
}
