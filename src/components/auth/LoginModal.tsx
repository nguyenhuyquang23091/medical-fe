"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "../../app/context/AuthContext"
import { useState } from "react"


export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, switchToRegister, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt", { email, password });
    login();
    
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm ">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <Card className="border-0 shadow-none">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <button 
                onClick={closeLoginModal}
                className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
              >
                ✕
              </button>
            </div>
            <CardDescription>Enter your email and password to login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="@gmail.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full hover:bg-blue-500 hover:cursor-pointer">
                Login
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={switchToRegister} 
                  className="text-blue-500 hover:underline focus:outline-none hover:cursor-pointer"
              
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