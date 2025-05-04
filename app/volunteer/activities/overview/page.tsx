"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Heart, MapPin, Users } from "lucide-react"
import { getActivities, joinActivity, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

export default function ActivitiesOverviewPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        const activitiesData = await getActivities()
        // 只显示已审批的活动
        const approvedActivities = activitiesData.filter((activity: any) => activity.status === "approved")
        setActivities(approvedActivities)
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

        // 更新活动列表中的参与者信息
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
      <h1 className="text-3xl font-bold tracking-tight">志愿活动总览</h1>
      <p className="text-muted-foreground">浏览并报名参加志愿活动</p>

      {isBlacklisted() && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
          您当前处于志愿黑名单中，一周内不能报名参加志愿活动。请提高您的信誉分。
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部活动</TabsTrigger>
          <TabsTrigger value="hot">热门活动</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <Card key={activity.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      {activity.isHot && <Badge className="bg-red-500">热门</Badge>}
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
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
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
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">暂无可报名的活动</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hot" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.filter((activity) => activity.isHot).length > 0 ? (
              activities
                .filter((activity) => activity.isHot)
                .map((activity) => (
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
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
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
                    </CardFooter>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">暂无热门活动</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
