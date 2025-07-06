"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserInterviews } from "@/components/user-interviews"
import { UserSettings } from "@/components/user-settings"
import { Edit, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import axios from 'axios'

export default function ProfilePage() {
  const [user, setUser] = useState({ name: '', email: '', photoURL: '' });
  const [stats, setStats] = useState({
    interviewCount: 0,
    totalLikes: 0,
    totalComments: 0,
    memberSince: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch user profile and stats in parallel
    const fetchProfile = axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile-data`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const fetchStats = axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    Promise.all([fetchProfile, fetchStats])
      .then(([profileRes, statsRes]) => {
        setUser(profileRes.data);
        setStats(statsRes.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="container py-10 animate-fade-in">
      <div className="grid gap-8 md:grid-cols-2">

        {/* Profile & Stats Side */}
        <div className="space-y-2">
          {/* Profile Card */}
          <Card className="flex-1 w-full transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.photoURL} alt="User" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              <div className="space-y-1 w-full overflow-hidden">
                <CardTitle className="truncate">{user.name}</CardTitle>
                <CardDescription className="flex items-center break-words">
                  <Mail className="mr-1 h-3 w-3" />
                  {user.email}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full transition-transform duration-200 ease-in-out hover:scale-105"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="flex-1 w-full transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interviews Shared</span>
                <span className="font-medium">{stats.interviewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Likes</span>
                <span className="font-medium">{stats.totalLikes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Comments</span>
                <span className="font-medium">{stats.totalComments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">
                  {new Date(stats.memberSince).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Side */}
        <div>
          <Tabs defaultValue="interviews">
            <TabsList className="mb-6">
              <TabsTrigger value="interviews">My Interviews</TabsTrigger>
              {/* <TabsTrigger value="settings">Account Settings</TabsTrigger> */}
            </TabsList>
            <TabsContent value="interviews">
              <UserInterviews />
            </TabsContent>
            <TabsContent value="settings">
              <UserSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
