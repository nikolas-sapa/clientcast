import type { Metadata } from 'next';
import { Sora, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Clientcast — ship work, skip the update emails',
  description: 'Share a live link instead of writing another status email. Clients see exactly what you shipped.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable} ${mono.variable}`}>
      <body className="bg-[#0B0B0D] text-[#F3F2EE] font-[family-name:var(--font-jakarta)] antialiased">
        {children}
      </body>
    </html>
  );
}
