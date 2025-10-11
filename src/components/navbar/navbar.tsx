"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useNavbarProfile } from "@/hooks/useNavbarProfile";
import { ProfileDropdown } from "../ui/profile-dropdown";
import { NavbarLoadingSkeleton } from "../ui/profile-loading-skeleton";
import { NotificationDropdown } from "../patient/NotificationDropdown";

export default function Navbar(){
    const router = useRouter();

    const [isSticky, setIsSticky] = useState(false);
    const { openLoginModal, openRegisterModal, isLoggedIn, logout, status } = useAuth();
    const { profile, isLoading: profileLoading } = useNavbarProfile();

    useEffect(() => {
        // Do something on page load. EMPTY ARRAY at the end.
        const handleScroll = () => {
            if(typeof window !== 'undefined' && window.scrollY > 400){
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        const onLoad = () => {
            if (typeof window !== 'undefined') {
                window.addEventListener('scroll', handleScroll);
            }
        };

        onLoad();

        return () => {
            // Do something on page unmount.
            const onUnmount = () => {
                if (typeof window !== 'undefined') {
                    window.removeEventListener('scroll', handleScroll);
                }
            };
            onUnmount();
        };
    }, [])

    const navLinks = [
        { title: "Home", href: "/" },
        { title: "Blog", href: "/" },
        { title: "Page", href: "/" },
        {title : "Appointments", href: "/appointments"},
        { title: "Contact", href: "/" },
    ];

    const handleViewProfile = () =>{
        router.push("/profile");
    }
    const handleViewAppointments = () => {
        router.push("/appointments");
    }

    const handleSettings = () => {

    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/'); // Redirect to home page after logout
        } catch (error) {
            console.error('Logout failed:', error);
            // The error is already handled in AuthContext
        }
    }

    return (
        <>
        <nav className={`bg-white transition-all duration-300 ${
            isSticky
            ? 'fixed top-0 left-0 w-full shadow-md z-50 animate-slideDown '
            : ''
        }`}>
            <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-0.5">
                        <Image
                            src="/images/logo2.jpg"
                            alt="MedConnect Logo"
                            width={70}
                            height={65}
                            className="rounded-full"
                        />
                        <Link href="/" className="text-black hover:text-gray-600 font-bold text-3xl">
                            MedConnect
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center space-x-4">
                            {navLinks.map((link) => (
                                <Link
                                key = {link.title}
                                href={link.href}
                                 className="text-stone-500 hover:text-gray-600"
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                    {status === 'loading' || (isLoggedIn && profileLoading) ? (
                        <NavbarLoadingSkeleton />
                    ) : isLoggedIn ? (
                        <>
                            <NotificationDropdown />
                            <ProfileDropdown
                                onViewProfile={handleViewProfile}
                                onSettings={handleSettings}
                                onAppointments={handleViewAppointments}
                                onLogout={handleLogout}
                            />
                        </>
                    ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={openLoginModal}
                            className="text-stone-500 hover:text-gray-600 hover:cursor-pointer"

                            >
                                Login
                            </Button>
                            <Button
                            variant="outline"
                            onClick={openRegisterModal}
                            className="text-stone-500 hover:text-gray-600 hover:cursor-pointer"
                            >
                                Register
                            </Button>

                        </>

                    )}
                    </div> 

                </div>
            </div>
            
        </nav>
        </>
    )
}


  