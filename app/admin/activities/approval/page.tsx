"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { getActivities, updateActivity, getUsers } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ActivityApprovalPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [managers, setManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesData = await getActivities()
        // 只显示待审批的活动
        const pendingActivities = activitiesData.filter((activity: any) => activity.status === "pending")
        setActivities(pendingActivities)

        const usersData = await getUsers("manager")
        setManagers(usersData)
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

  const handleApprove = async (activityId: string, managerId: string) => {
    setProcessing(activityId)

    try {
      await updateActivity(activityId, {
        status: "approved",
        managerId,
      })

      // 更新活动列表
      setActivities(activities.filter((activity) => activity.id !== activityId))

      toast({
        title: "审批成功",
        description: "活动已成功审批",
      })
    } catch (error) {
      toast({
        title: "审批失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (activityId: string) => {
    setProcessing(activityId)

    try {
      await updateActivity(activityId, {
        status: "rejected",
      })

      // 更新活动列表
      setActivities(activities.filter((activity) => activity.id !== activityId))

      toast({
        title: "已拒绝",
        description: "活动申请已被拒绝",
      })
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">活动申报审批</h1>
      <p className="text-muted-foreground">审批志愿活动申请</p>

      {activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity.id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{activity.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">{activity.type}类</CardDescription>
                  </div>
                  <Badge variant="outline">待审批</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <p className="line-clamp-2">{activity.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>活动日期: {new Date(activity.startTime).toLocaleDateString("zh-CN")}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        活动时间:{" "}
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
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="truncate">活动地点: {activity.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4" />
                      <span>
                        参与人数: {activity.minParticipants} - {activity.maxParticipants}人
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        活动时长:{" "}
                        {(new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) /
                          (1000 * 60 * 60)}
                        小时
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 mt-auto">
                <Button
                  variant="outline"
                  onClick={() => handleReject(activity.id)}
                  disabled={processing === activity.id}
                  size="sm"
                >
                  拒绝
                </Button>
                <Button
                  onClick={() => handleApprove(activity.id, activity.managerId)}
                  disabled={processing === activity.id}
                  size="sm"
                >
                  {processing === activity.id ? "处理中..." : "批准"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">暂无待审批的活动</h3>
          <p className="text-muted-foreground mt-1">当有新的活动申请时会显示在这里</p>
        </div>
      )}
    </div>
  )
}
