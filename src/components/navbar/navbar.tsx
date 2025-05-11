"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";


export default function Navbar(){
    const [isSticky, setIsSticky] = useState(false);
    const { openLoginModal, openRegisterModal, isLoggedIn} = useAuth()

    useEffect(() => {
        const handleScroll = () =>{
            if(window.scrollY > 400){
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navLinks = [
        { title: "Home", href: "/" },
        { title: "Department", href: "/" },
        { title: "Blog", href: "/" },
        { title: "Page", href: "/" },
        { title: "Doctors", href: "/doctor" },
        { title: "Contact", href: "/" },
    ];
  
          
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
                    {isLoggedIn ? (
                        <>
                            <Button asChild className="bg-blue-400 hover:bg-blue-500">
                            <Link href="/appointment" className="flex items-center"> Making an Appointment</Link>
                        </Button>
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


  