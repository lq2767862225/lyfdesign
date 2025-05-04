"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, MessageSquare, Users } from "lucide-react"
import { getActivities, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function MyActivitiesPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (user) {
          const activitiesData = await getActivities()
          // 筛选出当前负责人负责的活动
          const myActivities = activitiesData.filter((activity: any) => activity.managerId === user.id)
          setActivities(myActivities)
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">我的活动</h1>
        <Link href="/manager/activities/create">
          <Button>申报新活动</Button>
        </Link>
      </div>
      <p className="text-muted-foreground">管理您负责的志愿活动</p>

      {activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{activity.title}</CardTitle>
                    <CardDescription>{activity.type}类活动</CardDescription>
                  </div>
                  <Badge
                    className={
                      activity.status === "pending"
                        ? "bg-yellow-500"
                        : activity.status === "approved"
                          ? "bg-green-500"
                          : activity.status === "rejected"
                            ? "bg-red-500"
                            : activity.status === "completed"
                              ? "bg-blue-500"
                              : "bg-gray-500"
                    }
                  >
                    {activity.status === "pending"
                      ? "待审批"
                      : activity.status === "approved"
                        ? "已审批"
                        : activity.status === "rejected"
                          ? "已拒绝"
                          : activity.status === "completed"
                            ? "已完成"
                            : "已取消"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">{activity.description}</p>

                  <div className="grid grid-cols-2 gap-2">
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href="/manager/communication/check-in">
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    签到管理
                  </Button>
                </Link>
                <Link href="/manager/communication/chats">
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    群聊
                  </Button>
                </Link>
                <Button>查看详情</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">暂无活动</h3>
          <p className="text-muted-foreground mt-1">您还没有负责的活动，可以申报新活动</p>
          <div className="mt-4">
            <Link href="/manager/activities/create">
              <Button>申报新活动</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
