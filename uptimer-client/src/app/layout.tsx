import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomApolloProvider from "@/components/apollo/CustomApolloProvider";
import { ToastContainer } from "react-toastify";
import { MonitorProvider } from "@/context/MonitorContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uptimer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomApolloProvider>
          <MonitorProvider>{children}</MonitorProvider>
          <ToastContainer />
        </CustomApolloProvider>
      </body>
    </html>
  );
}
