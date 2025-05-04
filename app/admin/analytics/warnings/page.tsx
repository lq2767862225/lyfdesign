"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, AlertTriangle, Bell } from "lucide-react"
import { getActivities } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function WarningsPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesData = await getActivities()
        setActivities(activitiesData)
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

  // 筛选出有预警的活动
  const getWarningActivities = () => {
    const now = new Date()

    return activities.filter((activity) => {
      // 报名人数不足预警
      const isParticipantsWarning =
        activity.status === "approved" &&
        activity.participants.length < activity.minParticipants &&
        new Date(activity.startTime) > now

      // 即将开始但报名人数不足预警
      const isUpcomingWarning =
        activity.status === "approved" &&
        activity.participants.length < activity.minParticipants &&
        new Date(activity.startTime) > now &&
        new Date(activity.startTime).getTime() - now.getTime() < 1000 * 60 * 60 * 24 * 3 // 3天内

      return isParticipantsWarning || isUpcomingWarning
    })
  }

  const warningActivities = getWarningActivities()

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">活动预警</h1>
        <Badge variant="destructive" className="text-base px-3 py-1">
          {warningActivities.length} 个预警
        </Badge>
      </div>
      <p className="text-muted-foreground">查看需要关注的活动预警信息</p>

      {warningActivities.length > 0 ? (
        <div className="space-y-6">
          {warningActivities.map((activity) => {
            const startDate = new Date(activity.startTime)
            const now = new Date()
            const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            const isUrgent = daysUntilStart <= 1

            return (
              <Card key={activity.id} className={isUrgent ? "border-red-300" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{activity.title}</CardTitle>
                      <CardDescription>{activity.type}类</CardDescription>
                    </div>
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      预警
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">报名人数不足</p>
                          <p className="text-sm mt-1 text-red-700">
                            当前报名人数: {activity.participants.length}/{activity.minParticipants} (最少需要)
                            {daysUntilStart <= 3 && (
                              <span className="ml-2 font-semibold">距离活动开始仅剩 {daysUntilStart} 天!</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>活动日期: {startDate.toLocaleDateString("zh-CN")}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>
                            活动时间: {startDate.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} -
                            {new Date(activity.endTime).toLocaleTimeString("zh-CN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>活动地点: {activity.location}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4" />
                          <span>
                            参与人数: {activity.participants.length}/{activity.maxParticipants}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>
                            服务时长:{" "}
                            {(new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) /
                              (1000 * 60 * 60)}
                            小时
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>报名截止: {new Date(activity.registrationDeadline).toLocaleDateString("zh-CN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button>查看详情</Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">暂无活动预警</h3>
          <p className="text-muted-foreground mt-1">所有活动运行正常</p>
        </div>
      )}
    </div>
  )
}
