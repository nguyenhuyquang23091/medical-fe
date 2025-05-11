"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ShadcnDatePicker from "@/components/ui/shadcn-date-picker"
import { useState } from "react"
import { useAuth } from "../../app/context/AuthContext"
import { RegisterData } from "@/api/auth"
import { registerSchema } from "@/lib/validation"
import { z } from "zod";

export default function RegisterModal() {
  const { isRegisterModalOpen, closeRegisterModal, switchToLogin, register } = useAuth();
  // Add state for form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [birthdate, setBirthdate] = useState<Date>(new Date(2000, 0, 1));
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedDate = birthdate.toISOString().split('T')[0];

    try {
      const result = registerSchema.parse({
        ...formData,
        dob: formattedDate
      });

      setErrors({});
      const registerData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dob: formattedDate,
      };  
      await register(registerData);
    } catch(error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        
        error.errors.forEach((err) => {
          const field = err.path[0];
          fieldErrors[field as string] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setRegisterError("Unexpected error");
        console.error("Validation Error", error);
      }
    }
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
              {registerError && (
                <div className="text-red-500 text-sm mb-4">
                  {registerError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Lee" 
                    required 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Robinson" 
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs">{errors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="leerobinson" 
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs">{errors.username}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="@gmail.com" 
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
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
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
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



