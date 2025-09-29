"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Mail, Phone, Loader2, Globe, UserRoundPen, Camera, Eye, EyeOff } from "lucide-react"
import { ProfilePageSkeleton } from "@/components/ui/profile-loading-skeleton"
import { ProfileUpdateRequest, AuthDataUpdateRequest } from "@/types"
import { useUserProfile } from "@/app/context/UserProfileContext"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export default function ProfilePage() {
  const { status } = useSession()
  const { userProfile: profileData, authData, userProfileError, updateUserProfile, updateAuthCredential, updateAvatar } = useUserProfile()
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<ProfileUpdateRequest>({
    firstName: "",
    lastName: "",
    dob: "",
    city: "",
  })
  const [editAuthData, setEditAuthData] = useState<AuthDataUpdateRequest>({
    username: "",
    password: "",
    email: ""
  })
  const [profileCompletion] = useState(66)
  const [settingsTab, setSettingsTab] = useState<"profile" | "account">("profile")
  const [showPassword, setShowPassword] = useState(false)


  // Initialize edit data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setEditData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dob: profileData.dob,
        city: profileData.city,
      })
    }
  }, [profileData])

  useEffect(() => {
    if (authData) {
      setEditAuthData({
        username: authData.username,
        password: "",
        email: authData.email,
      })
    }
  }, [authData])

 

  const handleSave = async () => {
    try {
      setIsSaving(true)
    
      // Determine which tab is active to know what to update
      if (settingsTab === "profile") {
        // Validate profile data
        if (!editData.firstName || !editData.lastName || !editData.dob || !editData.city) {
          toast.error("All profile fields are required")
          setIsSaving(false)
          return
        }
        
        // Update profile data using context
        await updateUserProfile(editData)
        toast.success("Profile updated successfully")
      } else if (settingsTab === "account") {
        // Validate account data
        if (!editAuthData.username || !editAuthData.email) {
          toast.error("Username and email are required")
          setIsSaving(false)
          return
        }
        
        // Create auth update data
        const updateData: AuthDataUpdateRequest = {
          username: editAuthData.username,
          email: editAuthData.email,
          password: editAuthData.password || ""
        }
        
        // Update auth data using context
        await updateAuthCredential(updateData)
        toast.success("Account updated successfully")
        
        // Reset password field after successful update
        setEditAuthData({
          ...editAuthData,
          password: ""
        })
      }
    } catch (err) {
      console.error("Failed to update:", err)
      toast.error("Failed to update. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profileData) {
      setEditData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dob: profileData.dob,
        city: profileData.city,
      })
    }
  }

  const handleInputChange = (field: keyof ProfileUpdateRequest, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleSettingsTabChange = (tab: "profile" | "account") => {
    setSettingsTab(tab);
  };

  const handleAvatarUpload = async(event : React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(!file) return;

    if(!file.type.match("image.*")){
      toast.error("Please upload a valid image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      await updateAvatar(file);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar. Please try again.");
    }
  };

  // Handle authentication states
  if (status === "loading") {
    return <ProfilePageSkeleton />
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-orange-600">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to view your profile.</p>
            <Button 
              onClick={() => window.location.href = "/login"} 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (userProfileError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{userProfileError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) {
    return <ProfilePageSkeleton />
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50">Overview</TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-blue-50">Prescriptions</TabsTrigger>
            </TabsList>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-md">
                  <UserRoundPen className="h-4 w-4" />
                  <span className="sr-only">Edit Profile</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Edit Profile</DialogTitle>
                  <DialogDescription>
                    Manage your account settings and set e-mail preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-6 py-4">
                  <div className="col-span-4 md:col-span-1">
                    <div className="space-y-2">
                      <div 
                        className={`font-medium text-sm p-2 cursor-pointer ${settingsTab === "profile" ? "text-blue-600 bg-blue-50 rounded-md" : "text-gray-600 hover:text-blue-600"}`}
                        onClick={() => handleSettingsTabChange("profile")}
                      >
                        Profile
                      </div>
                      <div 
                        className={`font-medium text-sm p-2 cursor-pointer ${settingsTab === "account" ? "text-blue-600 bg-blue-50 rounded-md" : "text-gray-600 hover:text-blue-600"}`}
                        onClick={() => handleSettingsTabChange("account")}
                      >
                        Account
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    {settingsTab === "profile" && (
                      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div>
                          <h3 className="text-lg font-medium">Profile Information</h3>
                          <p className="text-sm text-gray-500">Update your personal information.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input 
                                id="firstName" 
                                value={editData.firstName} 
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input 
                                id="lastName" 
                                value={editData.lastName} 
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input 
                              id="city" 
                              value={editData.city} 
                              onChange={(e) => handleInputChange("city", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" type="button" onClick={() => handleCancel()}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSaving} className="hover:cursor-pointer">
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save changes"
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                    
                    {settingsTab === "account" && (
                      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div>
                          <h3 className="text-lg font-medium">Account Settings</h3>
                          <p className="text-sm text-gray-500">Manage your account credentials.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input 
                              id="username" 
                              value={editAuthData.username}
                              onChange={(e) => setEditAuthData({...editAuthData, username: e.target.value})}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              This is your public display name. You can only change this once every 30 days.
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              type="email"
                              value={editAuthData.email}
                              onChange={(e) => setEditAuthData({...editAuthData, email: e.target.value})}
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              You can manage verified email addresses in your email settings.
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative mt-1">
                              <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={editAuthData.password}
                                onChange={(e) => setEditAuthData({...editAuthData, password: e.target.value})}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Leave blank to keep your current password.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer" disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update account"
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-1">
                <Card className="border shadow-sm mb-6 overflow-hidden">
                  <div className="relative">
                    <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">Pro</Badge>
                  </div>
                  <div className="pt-6 px-6 flex flex-col items-center">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt="Profile" />
                        <AvatarFallback className="bg-blue-500 text-white text-xl font-semibold">
                          {getInitials(profileData.firstName, profileData.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Upload Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-400 bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="h-6 w-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          title="Upload avatar"
                        />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold mt-4">{profileData.firstName} {profileData.lastName}</h2>
                    <p className="text-gray-500 text-sm">Project Manager</p>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <p className="text-sm text-gray-700">{profileData.userId}@example.com</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <p className="text-sm text-gray-700">(+1-876) 8654 239 581</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <p className="text-sm text-gray-700">{profileData.city}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <p className="text-sm text-gray-700 hover:text-blue-600">https://medconnect.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Complete Your Profile</CardTitle>
                    <div className="flex items-center gap-2">
                      <Progress value={profileCompletion} className="h-2" />
                      <span className="text-sm font-medium text-gray-600">{profileCompletion}%</span>
                    </div>
                  </CardHeader>
                </Card>    
              </div>

              {/* Right Column - Activities and Connections */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">About Me</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-700">
                        Hi I'm {profileData.firstName} {profileData.lastName}. It will be as simple as Occidental; in fact, it will 
                        be Occidental. To an English person, it will seem like simplified 
                        English, as a skeptical Cambridge friend of mine told me what 
                        Occidental is European languages are members of the same family.
                      </p>
                      <p className="text-sm text-gray-700 mt-4">
                        You always want to make sure that your fonts work well together 
                        and try to limit the number of fonts you use to three or less. 
                        Experiment and play around with the fonts that you already have 
                        in the software you're working with reputable font websites. This may 
                        be the most commonly encountered tip I received from the 
                        designers I spoke with. They highly encourage that you use 
                        different fonts in one design, but do not over-exaggerate and go overboard.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-medium">Connections</CardTitle>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Connection 1 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>OD</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Olivia Davis</p>
                              <p className="text-xs text-gray-500">olivia.davis@example.com</p>
                            </div>
                          </div>
                          <Button size="sm">Connect</Button>
                        </div>
                        
                        {/* Connection 2 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">John Doe</p>
                              <p className="text-xs text-gray-500">john.doe@example.com</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Disconnect</Button>
                        </div>
                        
                        {/* Connection 3 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>AS</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Alice Smith</p>
                              <p className="text-xs text-gray-500">alice.smith@example.com</p>
                            </div>
                          </div>
                          <Button size="sm">Connect</Button>
                        </div>
                        
                        {/* Connection 4 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>MJ</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Michael Johnson</p>
                              <p className="text-xs text-gray-500">michael.johnson@example.com</p>
                            </div>
                          </div>
                          <Button size="sm">Connect</Button>
                        </div>
                        
                        {/* Connection 5 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>EM</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">Emily Martinez</p>
                              <p className="text-xs text-gray-500">emily.martinez@example.com</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Disconnect</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>View and manage your projects here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Projects content will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Activities</CardTitle>
                <CardDescription>Track all your activities here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Activities content will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>View team members here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Members content will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
