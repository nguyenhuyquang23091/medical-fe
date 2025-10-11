"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "../../app/context/AuthContext"
import { useState, useEffect, useRef } from "react"
import { loginSchema } from "@/types"
import { z } from "zod";
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, switchToRegister, login, loginError, isLoading, isLoggedIn, status, hasJustLoggedIn, resetLoginState } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const toastShownRef = useRef(false);

  // Reset errors when modal opens/closes
  useEffect(() => {
    if (isLoginModalOpen) {
      setErrors({});
    }
  }, [isLoginModalOpen]);

  // Show success toast only once when user has just logged in
  useEffect(() => {
    if (hasJustLoggedIn && isLoggedIn && status === 'authenticated' && !isLoginModalOpen && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success('Logged in successfully!');
      resetLoginState();
    }
  }, [hasJustLoggedIn, isLoggedIn, status, isLoginModalOpen, resetLoginState]);

  // Reset toast flag when component unmounts or user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      toastShownRef.current = false;
    }
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    
    try {
      const result = loginSchema.parse({
        identifier: identifier,
        password: password
      });
      
      const loadingToast = toast.loading('Logging in...');
      
      await login(identifier, password);
      
      toast.dismiss(loadingToast);
      
    } catch(error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        
        error.errors.forEach((err) => {
          const field = err.path[0];
          fieldErrors[field as string] = err.message;
        });
        setErrors(fieldErrors);
        toast.error('Please check your information and try again.');
      } else {
        console.error("Validation Error", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <Card className="border-0 shadow-none">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <button 
                onClick={closeLoginModal}
                className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                aria-label="Close login modal"
              >
                ✕
              </button>
            </div>
            <CardDescription>Enter your email/username and password to login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                <div className="flex items-start space-x-2 text-red-600 text-sm mb-4 p-3 bg-red-50 rounded border border-red-200">
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input 
                  id="identifier" 
                  type="text" 
                  placeholder="Email or username" 
                  required 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={errors.identifier ? "border-red-500" : ""}
                  disabled={submitting || isLoading}
                />
                {errors.identifier && (
                  <p className="text-red-500 text-xs">{errors.identifier}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                  disabled={submitting || isLoading}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full hover:bg-blue-500 hover:cursor-pointer"
                disabled={submitting || isLoading}
              >
                {(submitting || isLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={switchToRegister} 
                  className="text-blue-500 hover:underline focus:outline-none hover:cursor-pointer"
                  disabled={submitting || isLoading}
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}