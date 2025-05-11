"use client"
import Link from "next/link"
import Image from "next/image";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Car } from "lucide-react";
import { CiMedicalCross } from "react-icons/ci";
import { useState } from "react";
import { title } from "process";
import { Item } from "@radix-ui/react-navigation-menu";
import { Text_Me_One } from "next/font/google";


export default function Doctors() {
    const [activeTab, setActiveTab] = useState(0);
    const carouselTab = [
        {
            src: "/images/doctor7.jpg",
            alt: "Doctor Thomas",
            name: "Dr. Thomas",
            role: "Cardiologist",
           
        },
        {
            src: "/images/doctor8.jpg",
            alt: "Doctor Tony",
            name: "Dr. Tony",
            role: "Cardiologist",
           
        },
        {
            src: "/images/doctor9.jpg",
            alt: "Doctor Gumball",
            name: "Dr. Gumball",
            role: "Cardiologist",
        
        },
        {
            src: "/images/doctor10.jpg",
            alt: "Doctor Bill",
            name: "Dr. Bill",
            role: "Cardiologist",
          
        }
    ]

    const tabContent = [
        {
            src:"/images/doctor6.png",
            icon: <CiMedicalCross className="text-5xl text-white bg-sky-500 rounded-full " />,
            title: "Excellent Service",
            alt: "Doctor Image1",
            description: "We provide round-the-clock support to ensure you get the assistance you need, whenever you need it. Our dedicated team is always ready to help."
            
        },
        {
             src:"/images/doctor6.png",
            icon: <CiMedicalCross className="text-5xl text-white bg-sky-500 rounded-full" />,
            title: "Premium Quality",
            alt: "Doctor Image",
            description: "Experience top-notch service with a focus on quality, efficiency, and customer satisfaction. We go the extra mile to exceed expectations."
        },
        
        {
             src:"/images/doctor6.png",
            icon: <CiMedicalCross className="text-5xl text-white bg-sky-500 rounded-full" />,
            title: "Fast & Efficient",
            alt: "Doctor Image2",
            description: "Our services are designed to be quick, efficient, and hassle-free. Get the best results in the shortest time with our expert solutions."
        }
    ];
    
    const images = [
        {
                src:"/images/doctor3.jpg",
                alt: "Doctor Image2",
                quotes: "A healthy heart starts with prevention—eat well, stay active, and stress less."

        },
        {
            src:"/images/doctor4.jpg",
            alt: "Doctor Image3",
            quotes: "Protect your heart: move more, eat smart, stress less."
    },
    {
        src:"/images/doctor5.jpg",
        alt: "Doctor Image4",
        quotes: "Prevention beats cure—love your heart daily."
},
    ]
    return (
        <>
        <section className="relative w-full h-[400px] "> 
            <Image
                src="/banner/banner2.jpg"
                alt="Doctor Banner"
                fill={true}
                priority  
                className="object-right-top object-cover z-0 " 
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-300 from-5%  z-10" />
            {/* Content */}
            <div className="relative z-20 container mx-auto px-8 h-full flex flex-col justify-center ">
                <h3 className="text-4xl font-bold mb-4 text-white " >About Us</h3>
                <div className="flex items-center space-x-2 text-white ">
                    <Link href="/" className="hover:underline">Home</Link>
                    <span>/</span>
                    <span>About</span>
                </div>
            </div>
        </section>
        <section className="py-16">
            <div className="container mx-auto px-8">
                <div className="flex gap-8"> 
                    {/* Left Column - Images */}
                    <div className="w-1/2">
                        <div className="relative ">
                            <Image 
                                src="/images/doctor1.jpg"
                                alt="Doctor"
                                width={450}
                                height={550}
                                className="object-cover rounded-lg shadow-lg hover:shadow-gray-600 "
                            />
                            <Image 
                                src="/images/doctor2.jpg"
                                alt="Doctor"
                                width={350}
                                height={400}
                                className="absolute -bottom-10 -right-2 object-cover rounded-lg shadow-lg hover:shadow-gray-600"
                            />
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="w-1/2 flex flex-col justify-center">
                        <h2 className="text-xl font-medium mb-4">
                            <span className="underline decoration-sky-400">Welcome</span> to MedConnect
                        </h2>
                        <h3 className="text-4xl font-bold mb-6">
                            Best Care For Your
                            <br/>
                            Good Health
                        </h3>
                        <p className="font-light mb-8">
                        At MedConnect, we are dedicated to providing you with the best healthcare experience by combining cutting-edge 
                        medical technology, compassionate care, and 
                        seamless digital solutions to ensure easy access to high-quality healthcare 
                        whenever you need it.
                        </p>
                        <ul className="space-y-4 mb-4">
                            <li className="flex items-center gap-2">
                                <RiVerifiedBadgeFill className="text-sky-400 text-2xl"/>
                                <span>Comprehensive Care Options</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <RiVerifiedBadgeFill className="text-sky-400 text-2xl"/>
                                <span>Expert Guidance</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <RiVerifiedBadgeFill className="text-sky-400 text-2xl"/>
                                <span>Personalized Support</span>
                            </li>
                        </ul>
                        <div className="w-fit">
                        <Button 
                            size="default"
                            className="bg-white 
                                transition delay-75 ease-in-out 
                                hover:-translate-y-1 hover:scale-100 
                                hover:bg-sky-400 text-sky-400 hover:text-white 
                                border-1 border-sky-400
                                px-6 py-2
                                text-base font-light
                                mt-2
                                cursor-pointer
                               "
                        >
                            Learn More
                        </Button>

                        </div>
                        
                    </div>
                </div>
            </div>
        </section>
        <section className="relative w-full bg-gray-50">
            <div className="container mx-auto ">
                <Carousel>
                    <CarouselContent>
                        {images.map((image, index) => (
                            <CarouselItem key={index}>
                                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg h-[400px]">
                                    <Image 
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        className="object-cover object-[center_10%]"
                                        priority={index === 0}
                                    />
                                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                                    <blockquote className="text-white text-2xl md:text-3xl text-center px-6 max-w-md italic font-medium">
                                    {image.quotes}
                                    </blockquote>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                </Carousel>
            </div>
        </section>
        <section className="bg-gray-100 w-full h-screen">
            <div className="flex flex-col h-full">
                <ul className="flex justify-center gap-8 w-full">
                    {tabContent.map((item, index) => (
                        <li key={index}
                            className={`flex flex-col items-center cursor-pointer p-6 transition-colors ${
                                activeTab === index 
                                ? 'text-sky-400 bg-white shadow-md rounded-t-lg'
                                : 'text-sky-600'
                            }`}
                            onClick={() => setActiveTab(index)}
                        >
                            <div className="text-2xl text-black text-center">
                                {item.title}    
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="bg-white rounded-b-lg p-8 flex-grow">
                    <div className="flex gap-8">
                        <div className="w-1/2">
                            <div className="mb-4">
                                {tabContent[activeTab].icon}
                            </div>
                            {tabContent[activeTab].description}
                        </div>
                        <div className="w-1/2 relative h-[300px]">
                            <Image
                                src={tabContent[activeTab].src}
                                alt={tabContent[activeTab].alt}
                                fill={true}
                                className="object-cover rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>    
        </section>
        <hr className="mx-auto my-16 h-0.5 w-1/2 max-w-3xl border-0 bg-gray-200 dark:bg-gray-700" />
        <section className="w-full py-16">
            <div className="container mx-auto px-8">
                <div className="flex justify-between items-center mb-12">
                    <h3 className="text-3xl font-bold">
                        Expert Doctors
                    </h3>
                </div>
                <Carousel className="w-full">
                    <div className="flex justify-end mb-4 gap-4">
                        <CarouselPrevious />
                        <CarouselNext />
                    </div>
                    <CarouselContent className="flex gap-4">
                       {carouselTab.map((item, index) =>(
                        <CarouselItem key={index} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 min-w-0">
                            <Card className="border rounded-2xl overflow-hidden w-full max-w-[300px] mx-auto group/card p-0 transition duration-300 flex flex-col hover:bg-sky-300">
                                <div className="relative aspect-square w-full overflow-hidden">
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        fill={true}
                                        className="object-cover object-center w-full h-full transition-transform duration-300 ease-in-out group-hover/card:scale-110"
                                    />
                                </div>
                                <CardContent className="text-center p-4 transition-colors duration-300 group-hover/card:text-white">{item.name}</CardContent>
                            </Card>
                        </CarouselItem>
                       ))}
                    </CarouselContent>
                </Carousel>
            </div> 
        </section>
        <section className="w-full bg-blue-400/75 py-16">
            <div className="container mx-auto">
                <div className="flex gap-8"> 
                    <div className="w-1/2 px-8">
                        <div className="relative h-[200px] rounded-3xl  overflow-hidden">
                            <Image 
                                src="/images/doctor11.jpg"
                                fill={true}
                                alt="Emergency Contact"
                                className="object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/72 to-sky-400/55" />
                            
                            {/* Content */}
                            <div className="absolute inset-0 z-20">
                                <div className="h-full flex flex-col justify-center">
                                    <div className="flex justify-between items-center px-8">
                                        <div>
                                            <h3 className="text-2xl font-normal mb-4 text-white">
                                                For Any Emergency Contact
                                            </h3>
                                            <p className="text-md text-white">
                                                Esteem spirit temper too say adieus.
                                            </p>
                                        </div>
                                        <Button 
                                            size="lg"
                                            className="bg-white/20 text-white hover:bg-white hover:text-sky-400
                                                transition-all duration-300 ease-in-out
                                                rounded-full px-8
                                                text-md font-normal
                                                border border-white
                                                cursor-pointer
                                               "
                                        >
                                            +10 378 4673 467
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 px-8 border-l border-white/20">
                        <div className="relative h-[200px] rounded-3xl overflow-hidden shadow-lg">
                        <Image 
                                src="/images/doctor12.jpg"
                                fill={true}
                                alt="Emergency Contact"
                                className="object-cover object-[center_25%]"
                            />
                             {/* Gradient Overlay */}
                             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/72 to-sky-400/55" />
                            {/* Content */}
                            <div className="absolute inset-0 z-20">
                                <div className="h-full flex flex-col justify-center">
                                    <div className="flex justify-between items-center px-8">
                                        <div>
                                            <h3 className="text-2xl font-normal mb-4 text-white ">
                                                Make an Online Appointment
                                            </h3>
                                            <p className="text-md text-white px-2">
                                                Esteem spirit temper too say adieus.
                                            </p>
                                        </div>
                                        <Button 
                                            size="lg"
                                            className="bg-white/20 text-white hover:bg-white hover:text-sky-400
                                                transition-all duration-300 ease-in-out
                                                rounded-full px-6 mx-3
                                                text-md font-normal
                                               border border-white
                                                cursor-pointer
                                                
                                               "
                                        >
                                            Make An Appointment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="w-full">
            <div>

            </div>
        </section>
        </>
    )
    
}