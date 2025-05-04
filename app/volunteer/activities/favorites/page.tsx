"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Heart, MapPin, Users } from "lucide-react"
import { getActivities, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function FavoritesPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // 模拟收藏的活动ID
  const favoriteActivityIds = ["act1", "act3"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        const activitiesData = await getActivities()
        // 筛选出收藏的活动
        const favoriteActivities = activitiesData.filter((activity: any) => favoriteActivityIds.includes(activity.id))
        setActivities(favoriteActivities)
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

  const handleRemoveFavorite = (activityId: string) => {
    // 模拟从收藏中移除
    setActivities(activities.filter((activity) => activity.id !== activityId))
    toast({
      title: "已移除收藏",
      description: "活动已从收藏夹中移除",
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">收藏夹</h1>
        <p className="text-muted-foreground">查看您收藏的志愿活动</p>

        {activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity) => (
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
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFavorite(activity.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Heart className="mr-1 h-4 w-4 fill-current" />
                        取消收藏
                      </Button>
                      <Button
                          size="sm"
                          onClick={() => {
                            setSelectedActivity(activity)
                            setDetailsDialogOpen(true)
                          }}
                      >
                        查看详情
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
            </div>
        ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">收藏夹为空</h3>
              <p className="text-muted-foreground mt-1">您还没有收藏任何活动</p>
              <div className="mt-4">
                <Link href="/volunteer/activities/overview">
                  <Button>浏览活动</Button>
                </Link>
              </div>
            </div>
        )}

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedActivity?.title}</DialogTitle>
              <div className="flex items-center space-x-2 mt-2">
                {selectedActivity && (
                    <>
                      <Badge>{selectedActivity.type}类活动</Badge>
                      {selectedActivity.isHot && <Badge variant="destructive">热门</Badge>}
                      <Badge variant="outline" className="ml-auto">
                        {selectedActivity?.status === "pending"
                            ? "待审批"
                            : selectedActivity?.status === "approved"
                                ? "已审批"
                                : selectedActivity?.status === "completed"
                                    ? "已完成"
                                    : selectedActivity?.status === "canceled"
                                        ? "已取消"
                                        : "已拒绝"}
                      </Badge>
                    </>
                )}
              </div>
            </DialogHeader>

            {selectedActivity && (
                <div className="space-y-4 py-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">活动描述</h3>
                    <p className="text-muted-foreground">{selectedActivity.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>活动日期: {new Date(selectedActivity.startTime).toLocaleDateString("zh-CN")}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>
                      活动时间:{" "}
                          {new Date(selectedActivity.startTime).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -
                          {new Date(selectedActivity.endTime).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>活动地点: {selectedActivity.location}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4" />
                        <span>
                      已报名: {selectedActivity.participants.length}/{selectedActivity.maxParticipants}
                    </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>
                      服务时长:{" "}
                          {selectedActivity.serviceHours ||
                              (new Date(selectedActivity.endTime).getTime() -
                                  new Date(selectedActivity.startTime).getTime()) /
                              (1000 * 60 * 60)}{" "}
                          小时
                    </span>
                      </div>
                      {selectedActivity.registrationDeadline && (
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>
                        报名截止: {new Date(selectedActivity.registrationDeadline).toLocaleDateString("zh-CN")}
                      </span>
                          </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleRemoveFavorite(selectedActivity.id)
                          setDetailsDialogOpen(false)
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Heart className="mr-1 h-4 w-4 fill-current" />
                      取消收藏
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                          setDetailsDialogOpen(false)
                          window.location.href = `/volunteer/activities/overview`
                        }}
                    >
                      浏览更多活动
                    </Button>
                  </div>
                </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}
