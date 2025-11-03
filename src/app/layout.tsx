import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar"
import ConditionalFooter from "@/components/layout/ConditionalFooter"
import ConditionalChatBot from "@/components/layout/ConditionalChatBot"
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/app/context/AuthContext";
import { NotificationProvider } from "@/app/context/NotificationContext";
import { PaymentProvider } from "@/app/context/PaymentContext";
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
          <NotificationProvider>
            <PaymentProvider>
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
                </div>
              </AuthenticatedApp>
            </PaymentProvider>
          </NotificationProvider>
        </AuthProvider>
        </Providers>
        {/* Move Toaster outside to ensure it's always on top */}
        <Toaster position="top-right" richColors expand={true} />
      </body>
    </html>
  )
}
