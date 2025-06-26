"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, Save, X, User, Calendar, MapPin, Mail, Phone, Loader2, Link, Globe, Download, Settings } from "lucide-react"
import profileService, { ProfileResponse, ProfileUpdateRequest } from "@/services/profile/profile"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null)
  const [editData, setEditData] = useState<ProfileUpdateRequest>({
    firstName: "",
    lastName: "",
    dob: "",
    city: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [profileCompletion, setProfileCompletion] = useState(66)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await profileService.getProfile()
        setProfileData(data)
        setEditData({
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob,
          city: data.city,
        })
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        setError("Failed to load profile data. Please try again later.")
        toast.error("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleEdit = () => {
    if (profileData) {
      setEditData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dob: profileData.dob,
        city: profileData.city,
      })
    }
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editData.firstName || !editData.lastName || !editData.dob || !editData.city) {
      toast.error("All fields are required")
      return
    }

    try {
      setIsSaving(true)
      const updatedProfile = await profileService.updateProfile(editData)
      setProfileData(updatedProfile)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast.error("Failed to update profile. Please try again.")
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
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof ProfileUpdateRequest, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>No profile data available.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50">Overview</TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-blue-50">Projects</TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:bg-blue-50">Activities</TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-blue-50">Members</TabsTrigger>
            </TabsList>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-md">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">Settings</DialogTitle>
                  <DialogDescription>
                    Manage your account settings and set e-mail preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-6 py-4">
                  <div className="col-span-4 md:col-span-1">
                    <div className="space-y-2">
                      <div className="font-medium text-sm text-blue-600 bg-blue-50 rounded-md p-2">Profile</div>
                      <div className="font-medium text-sm text-gray-600 hover:text-blue-600 p-2">Account</div>
                      <div className="font-medium text-sm text-gray-600 hover:text-blue-600 p-2">Appearance</div>
                      <div className="font-medium text-sm text-gray-600 hover:text-blue-600 p-2">Notifications</div>
                      <div className="font-medium text-sm text-gray-600 hover:text-blue-600 p-2">Display</div>
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value="shadcn" 
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Select defaultValue="email1">
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select a verified email to display" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email1">user@example.com</SelectItem>
                              <SelectItem value="email2">alternate@example.com</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            You can manage verified email addresses in your email settings.
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea 
                            id="bio" 
                            placeholder="Tell us about yourself" 
                            className="mt-1 resize-none" 
                            defaultValue="I own a computer."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You can @mention other users and organizations to link to them.
                          </p>
                        </div>
                        
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                          
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
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => handleCancel()}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
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
                    <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                      <AvatarImage src="/placeholder.svg" alt="Profile" />
                      <AvatarFallback className="bg-blue-500 text-white text-xl font-semibold">
                        {getInitials(profileData.firstName, profileData.lastName)}
                      </AvatarFallback>
                    </Avatar>
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
