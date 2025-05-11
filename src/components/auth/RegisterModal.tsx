"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ShadcnDatePicker from "@/components/ui/shadcn-date-picker"
import { useState } from "react"
import { useAuth } from "../../app/context/AuthContext"

export default function RegisterModal() {
  const { isRegisterModalOpen, closeRegisterModal, switchToLogin } = useAuth();
  // Add state for form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [birthdate, setBirthdate] = useState<Date>(new Date(2000, 0, 1));
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };
  
  const handleDateChange = (date: Date) => {
    setBirthdate(date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration
    console.log({
      ...formData,
      birthdate
    });
    // After successful registration, you would typically close the modal or switch to login
    // closeRegisterModal();
  };

  if (!isRegisterModalOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Register</CardTitle>
              <button 
                onClick={closeRegisterModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <CardDescription>Enter your information below to register for an account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Lee" 
                    required 
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Robinson" 
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="leerobinson" 
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2 mt-4">
                <Label>Date of Birth</Label>
                <div className="mt-1">
                  <ShadcnDatePicker
                    startYear={1920}
                    endYear={2023}
                    selected={birthdate}
                    onSelect={handleDateChange}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <CardFooter className="px-0 pt-4">
                <Button type="submit" className="w-full hover:cursor-pointer hover:bg-blue-500">Register</Button>
              </CardFooter>
              <div className="text-center text-sm mt-4">
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={switchToLogin} 
                  className="text-blue-500 hover:underline focus:outline-none hover:cursor-pointer"
                >
                  Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}