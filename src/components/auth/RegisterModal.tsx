"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ShadcnDatePicker from "@/components/ui/shadcn-date-picker"
import { useState, useEffect } from "react"
import { useAuth } from "../../app/context/AuthContext"
import { RegisterData } from "@/services/auth/auth"
import { registerSchema } from "@/lib/validation"
import { z } from "zod";
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AlertTriangle } from "lucide-react"

export default function RegisterModal() {
  const { isRegisterModalOpen, closeRegisterModal, switchToLogin, register, registerError, isLoading } = useAuth();
  // Add state for form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [birthdate, setBirthdate] = useState<Date>(new Date(2000, 0, 1));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Reset form errors when modal opens/closes
  useEffect(() => {
    if (isRegisterModalOpen) {
      setFormErrors({});
    }
  }, [isRegisterModalOpen]);
  
  // Add a useEffect to log when registerError changes
  useEffect(() => {
    if (registerError) {
      console.log("RegisterError updated:", registerError);
    }
  }, [registerError]);
  
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
    setSubmitting(true);
    setFormErrors({});
    
    try {
      const result = registerSchema.parse({
        ...formData,
        dob: formattedDate
      });

      const registerData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dob: formattedDate,
      };  
      
      // Show loading toast
      const loadingToast = toast.loading('Creating your account...');
      
      const success = await register(registerData);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // If successful, the success message will be handled by AuthContext
      if (success) {
        toast.success('Account created successfully! Please log in.');
      } else {
        // If we get here with no registerError, something else failed
        console.log("Registration returned false but no error was set");
      }
    } catch(error) {
      if (error instanceof z.ZodError) {
        // Handle form validation errors
        const fieldErrors: Record<string, string> = {};
        
        error.errors.forEach((err) => {
          const field = err.path[0];
          fieldErrors[field as string] = err.message;
        });
        setFormErrors(fieldErrors);
      } else if (error instanceof Error) {
        // This could be the error from the API
        console.log("Error message:", error.message);
      }
    } finally {
      setSubmitting(false);
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
                aria-label="Close registration modal"
              >
                ✕
              </button>
            </div>
            <CardDescription>Enter your information below to register for an account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              {registerError && (
                <div className="flex items-start space-x-2 text-red-600 text-sm mb-4 p-3 bg-red-50 rounded border border-red-200">
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{registerError}</span>
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
                    className={formErrors.firstName ? "border-red-500" : ""}
                    disabled={submitting || isLoading}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs">{formErrors.firstName}</p>
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
                    className={formErrors.lastName ? "border-red-500" : ""}
                    disabled={submitting || isLoading}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs">{formErrors.lastName}</p>
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
                    className={formErrors.username ? "border-red-500" : ""}
                    disabled={submitting || isLoading}
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-xs">{formErrors.username}</p>
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
                  className={formErrors.email ? "border-red-500" : ""}
                  disabled={submitting || isLoading}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs">{formErrors.email}</p>
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
                  className={formErrors.password ? "border-red-500" : ""}
                  disabled={submitting || isLoading}
                />
                {formErrors.password && (
                  <p className="text-red-500 text-xs">{formErrors.password}</p>
                )}
              </div>
              <CardFooter className="px-0 pt-4">
                <Button 
                  type="submit" 
                  className="w-full hover:cursor-pointer hover:bg-blue-500"
                  disabled={submitting || isLoading}
                >
                  {(submitting || isLoading) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </CardFooter>
              <div className="text-center text-sm mt-4">
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={switchToLogin} 
                  className="text-blue-500 hover:underline focus:outline-none hover:cursor-pointer"
                  disabled={submitting || isLoading}
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



