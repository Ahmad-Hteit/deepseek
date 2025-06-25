/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import ClientLayout from "./client-layout"; // ✅ Split client logic here

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "DeepSeek",
  description: "Full Stack Project",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en">
          <body className={`${inter.className} antialiased`}>
            <ClientLayout>{children}</ClientLayout>
          </body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
