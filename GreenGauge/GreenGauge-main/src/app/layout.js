import localFont from "next/font/local";
import "./globals.css";
import { AuthContextProvider } from '@/app/_components/AuthContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "GreenGauge",
  description: "Measure your energy usage from anywhere.",
  image: "/tree.png",
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: 'all',
      url: '/tree.png',
    }
  ],
};
// Icon designed by Freepik

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContextProvider>
        {children}
        </AuthContextProvider>

      </body>
    </html>
  );
}
