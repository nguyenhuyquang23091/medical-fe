import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar"
import ConditionalFooter from "@/components/layout/ConditionalFooter"
import ConditionalChatBot from "@/components/layout/ConditionalChatBot"
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/app/context/AuthContext";
import { AuthenticatedApp } from "@/components/app/AuthenticatedApp";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";


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
            <AuthenticatedApp>
              <div>
                <ConditionalNavbar />
                <main>
                  {children}
                </main>
                <ConditionalFooter/>
                <LoginModal/>
                <RegisterModal/>
                <ConditionalChatBot/>
                <Toaster position="top-right" />
              </div>
            </AuthenticatedApp>
          </AuthProvider>
        </Providers>

      </body>
    </html>
  )
}
