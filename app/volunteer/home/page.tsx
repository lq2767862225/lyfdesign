"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Clock, Heart, CalendarFold, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { getAnnouncements, getActivities, joinActivity, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function VolunteerHomePage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const user = await getCurrentUser()
        setCurrentUser(user)

        // Fetch announcements
        const announcementsData = await getAnnouncements()
        setAnnouncements(announcementsData)

        // Fetch activities and filter hot ones
        const activitiesData = await getActivities()
        const hotActivities = activitiesData.filter((activity: any) => activity.status === "approved" && activity.isHot)
        setActivities(hotActivities)
      } catch (error) {
        console.error("获取数据失败", error)
        toast({
          title: "获取数据失败",
          description: "请稍后再试",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleJoinActivity = async () => {
    if (!selectedActivity || !currentUser) return

    setJoining(true)

    try {
      const result = await joinActivity(selectedActivity.id, currentUser.id)

      if (result.success) {
        toast({
          title: "报名成功",
          description: "您已成功报名参加该活动",
        })

        // Update activities list with new participant info
        setActivities(
          activities.map((activity) => {
            if (activity.id === selectedActivity.id) {
              return {
                ...activity,
                participants: [...activity.participants, currentUser.id],
              }
            }
            return activity
          }),
        )
      } else {
        toast({
          title: "报名失败",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "报名失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setJoining(false)
      setDialogOpen(false)
    }
  }

  const openJoinDialog = (activity: any) => {
    setSelectedActivity(activity)
    setDialogOpen(true)
  }

  const hasJoined = (activity: any) => {
    return currentUser && activity.participants.includes(currentUser.id)
  }

  const isBlacklisted = () => {
    return currentUser && currentUser.creditScore <= 0
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">欢迎回来，志愿者</h1>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">
            公告 {announcements.length > 0 && <Badge className="ml-2">{announcements.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="hot-activities">
            热门活动 {activities.length > 0 && <Badge className="ml-2 bg-red-500">{activities.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab Content */}
        <TabsContent value="announcements" className="space-y-4 mt-4">
          <p className="text-muted-foreground">查看系统公告和重要通知</p>

          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CalendarFold className="mr-2 h-5 w-5 text-primary" />
                        <CardTitle>{announcement.title}</CardTitle>
                      </div>
                      {announcement.important && <Badge>重要</Badge>}
                    </div>
                    <CardDescription>
                      <div className="flex items-center mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>{new Date(announcement.createdAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{announcement.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无公告</h3>
              <p className="text-muted-foreground mt-1">当前没有任何系统公告</p>
            </div>
          )}
        </TabsContent>

        {/* Hot Activities Tab Content */}
        <TabsContent value="hot-activities" className="space-y-4 mt-4">
          <p className="text-muted-foreground">浏览当前最热门的志愿活动</p>

          {isBlacklisted() && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
              您当前处于志愿黑名单中，一周内不能报名参加志愿活动。请提高您的信誉分。
            </div>
          )}

          {activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <Badge className="bg-red-500">热门</Badge>
                    </div>
                    <CardDescription>{activity.type}类活动</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <p className="text-sm">{activity.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>{new Date(activity.startTime).toLocaleDateString("zh-CN")}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>
                          {new Date(activity.startTime).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -
                          {new Date(activity.endTime).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        <span>
                          已报名: {activity.participants.length}/{activity.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>服务时长: {activity.serviceHours}小时</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4 flex justify-between">
                    <Button variant="outline" size="sm">
                      <Heart className="mr-1 h-4 w-4" />
                      收藏
                    </Button>
                    <div className="space-x-2">
                      <Link href={`/volunteer/activities/details/${activity.id}`}>
                        <Button variant="outline" size="sm">
                          查看详情
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => openJoinDialog(activity)}
                        disabled={
                          hasJoined(activity) ||
                          isBlacklisted() ||
                          activity.participants.length >= activity.maxParticipants
                        }
                      >
                        {hasJoined(activity) ? "已报名" : "立即报名"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无热门活动</h3>
              <p className="text-muted-foreground mt-1">当前没有热门活动</p>
              <div className="mt-4">
                <Link href="/volunteer/activities/overview">
                  <Button>浏览所有活动</Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Activity Join Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认报名</DialogTitle>
            <DialogDescription>您确定要报名参加"{selectedActivity?.title}"活动吗？</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              活动时间: {selectedActivity && new Date(selectedActivity.startTime).toLocaleString("zh-CN")} 至{" "}
              {selectedActivity &&
                new Date(selectedActivity.endTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">活动地点: {selectedActivity?.location}</p>
            <p className="text-sm text-muted-foreground mt-1">服务时长: {selectedActivity?.serviceHours} 小时</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleJoinActivity} disabled={joining}>
              {joining ? "报名中..." : "确认报名"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
