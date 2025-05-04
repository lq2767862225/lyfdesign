"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Download, FileText, MapPin } from "lucide-react"
import { getActivities, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ServiceRecordsPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [totalHours, setTotalHours] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (user) {
          const activitiesData = await getActivities()
          // 筛选出当前用户参与的已完成活动
          const completedActivities = activitiesData.filter(
            (activity: any) => activity.participants.includes(user.id) && new Date(activity.endTime) < new Date(),
          )
          setActivities(completedActivities)

          // 计算总服务时长
          const hours = completedActivities.reduce((total, activity) => {
            return total + activity.serviceHours
          }, 0)
          setTotalHours(hours)
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">服务记录</h1>
      <p className="text-muted-foreground">查看您的志愿服务记录和证明</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>服务时长统计</CardTitle>
            <CardDescription>累计志愿服务时长</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-primary">{totalHours}</div>
              <p className="text-xl mt-2">小时</p>
              <p className="text-sm text-muted-foreground mt-4">共参与 {activities.length} 次志愿活动</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>服务证明</CardTitle>
            <CardDescription>下载志愿服务证明</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">志愿服务证明</h3>
                    <p className="text-sm text-muted-foreground mt-1">包含所有志愿活动的综合证明</p>
                  </div>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    下载证明
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">服务时长证明</h3>
                    <p className="text-sm text-muted-foreground mt-1">仅包含服务时长的简要证明</p>
                  </div>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    下载证明
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部记录</TabsTrigger>
          <TabsTrigger value="2025">2025年</TabsTrigger>
          <TabsTrigger value="2024">2024年</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{activity.title}</CardTitle>
                        <CardDescription>{activity.type}类活动</CardDescription>
                      </div>
                      <Badge variant="outline">已完成</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                        <div className="flex items-center text-sm font-medium text-green-600">
                          <FileText className="mr-1 h-4 w-4" />
                          <span>服务时长: {activity.serviceHours} 小时</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      下载单项证明
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无服务记录</h3>
              <p className="text-muted-foreground mt-1">您还没有参加过志愿活动</p>
              <div className="mt-4">
                <Link href="/volunteer/activities/overview">
                  <Button>浏览活动</Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="2025" className="mt-4">
          {activities.filter((a) => new Date(a.startTime).getFullYear() === 2025).length > 0 ? (
            <div className="space-y-4">
              {activities
                .filter((a) => new Date(a.startTime).getFullYear() === 2025)
                .map((activity) => (
                  <Card key={activity.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{activity.title}</CardTitle>
                          <CardDescription>{activity.type}类活动</CardDescription>
                        </div>
                        <Badge variant="outline">已完成</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
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
                          <div className="flex items-center text-sm font-medium text-green-600">
                            <FileText className="mr-1 h-4 w-4" />
                            <span>服务时长: {activity.serviceHours} 小时</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        下载单项证明
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">2025年暂无服务记录</h3>
              <p className="text-muted-foreground mt-1">您在2025年还没有参加过志愿活动</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="2024" className="mt-4">
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium">2024年暂无服务记录</h3>
            <p className="text-muted-foreground mt-1">您在2024年还没有参加过志愿活动</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
