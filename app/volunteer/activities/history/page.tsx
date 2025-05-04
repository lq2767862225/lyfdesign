"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Download, FileText, MapPin, MessageSquare, Users } from "lucide-react"
import { getActivities, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ActivityHistoryPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (user) {
          const activitiesData = await getActivities()
          // 筛选出当前用户参与的活动
          const participatedActivities = activitiesData.filter((activity: any) =>
              activity.participants.includes(user.id),
          )
          setActivities(participatedActivities)
        }
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

  // 将活动分为已完成和进行中
  const completedActivities = activities.filter((activity) => new Date(activity.endTime) < new Date())

  const ongoingActivities = activities.filter((activity) => new Date(activity.endTime) >= new Date())

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">历史参与</h1>
        <p className="text-muted-foreground">查看您参与过的志愿活动记录</p>

        <Tabs defaultValue="completed">
          <TabsList>
            <TabsTrigger value="completed">已完成 ({completedActivities.length})</TabsTrigger>
            <TabsTrigger value="ongoing">进行中 ({ongoingActivities.length})</TabsTrigger>
          </TabsList>

        <TabsContent value="completed" className="mt-4">
          {completedActivities.length > 0 ? (
            <div className="space-y-4">
              {completedActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="mb-2">{activity.title}</CardTitle>
                        <CardDescription>{activity.type}类活动</CardDescription>
                      </div>
                      <Badge variant="outline">已完成</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">{activity.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                            参与人数: {activity.participants.length}/{activity.maxParticipants}
                          </span>
                              </div>
                            </div>

                            <div className="flex items-center text-sm font-medium text-green-600">
                              <FileText className="mr-1 h-4 w-4" />
                              <span>获得服务时长: {activity.serviceHours} 小时</span>
                            </div>
                          </div>
                        </CardContent>
                        <div className="px-6 pb-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            下载证明
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
                        </div>
                      </Card>
                  ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg">
                  <h3 className="text-lg font-medium">暂无已完成的活动</h3>
                  <p className="text-muted-foreground mt-1">您还没有参加过志愿活动</p>
                  <div className="mt-4">
                    <Link href="/volunteer/activities/overview">
                      <Button>浏览活动</Button>
                    </Link>
                  </div>
                </div>
            )}
          </TabsContent>

        <TabsContent value="ongoing" className="mt-4">
          {ongoingActivities.length > 0 ? (
            <div className="space-y-4">
              {ongoingActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="mb-2">{activity.title}</CardTitle>
                        <CardDescription>{activity.type}类活动</CardDescription>
                      </div>
                      <Badge>进行中</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">{activity.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                            参与人数: {activity.participants.length}/{activity.maxParticipants}
                          </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <div className="px-6 pb-4 flex justify-end gap-2">
                          <Link href="/volunteer/messages/groups">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              进入群聊
                            </Button>
                          </Link>

                          <Button
                              size="sm"
                              onClick={() => {
                                setSelectedActivity(activity)
                                setDetailsDialogOpen(true)
                              }}
                          >
                            查看详情
                          </Button>
                        </div>
                      </Card>
                  ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg">
                  <h3 className="text-lg font-medium">暂无进行中的活动</h3>
                  <p className="text-muted-foreground mt-1">您当前没有参与进行中的志愿活动</p>
                  <div className="mt-4">
                    <Link href="/volunteer/activities/overview">
                      <Button>浏览活动</Button>
                    </Link>
                  </div>
                </div>
            )}
          </TabsContent>
        </Tabs>

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
                        {new Date(selectedActivity?.endTime) < new Date() ? "已完成" : "进行中"}
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
                      参与人数: {selectedActivity.participants.length}/{selectedActivity.maxParticipants}
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

                  <div className="flex justify-end gap-2 pt-4">
                    {new Date(selectedActivity.endTime) < new Date() && (
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          下载证明
                        </Button>
                    )}
                    {new Date(selectedActivity.endTime) >= new Date() && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (window.location.href = "/volunteer/messages/groups")}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          进入群聊
                        </Button>
                    )}
                  </div>
                </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}
