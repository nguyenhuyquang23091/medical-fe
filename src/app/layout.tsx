import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/navbar"
import { Montserrat } from "next/font/google";
import Footer from "@/components/footer/footer"
import { AuthProvider } from "@/app/context/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import ChatBot from "@/components/chatBot/chatBot";


const montserrat = Montserrat({subsets:['latin']})
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.className}>
      <body>
       <Providers>
          <AuthProvider>

        <div >
            <Navbar />
            <main>
              {children}
            </main>
            <Footer/>
            <LoginModal/>
            <RegisterModal/>
            <ChatBot/>
            <Toaster position="top-right" />
        </div>
        </AuthProvider>
        </Providers>
       
      </body>
    </html>
  )
}
