"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { getActivities, updateActivity, getUsers } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function ActivityApprovalPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [managers, setManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [warnings, setWarnings] = useState<any[]>([])
  const [filteredActivities, setFilteredActivities] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesData = await getActivities()
        setActivities(activitiesData)

        // 初始化筛选后的活动
        applyStatusFilter(activitiesData, "all")

        // 生成月度趋势数据
        generateMonthlyData(activitiesData)

        // 检查活动预警
        checkActivityWarnings(activitiesData)

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

  // 应用状态筛选
  const applyStatusFilter = (activities: any[], status: string) => {
    let filtered = activities
    if (status !== "all") {
      filtered = activities.filter((activity) => activity.status === status)
    }
    setFilteredActivities(filtered)
    setStatusFilter(status)
  }

  // 生成月度趋势数据
  const generateMonthlyData = (activities: any[]) => {
    const now = new Date()
    const monthsData = []

    // 生成过去6个月的数据
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = month.toLocaleDateString("zh-CN", { month: "short" })

      const approved = activities.filter((activity) => {
        const activityDate = new Date(activity.startTime)
        return (
            activityDate.getMonth() === month.getMonth() &&
            activityDate.getFullYear() === month.getFullYear() &&
            activity.status === "approved"
        )
      }).length

      const rejected = activities.filter((activity) => {
        const activityDate = new Date(activity.startTime)
        return (
            activityDate.getMonth() === month.getMonth() &&
            activityDate.getFullYear() === month.getFullYear() &&
            activity.status === "rejected"
        )
      }).length

      const pending = activities.filter((activity) => {
        const activityDate = new Date(activity.startTime)
        return (
            activityDate.getMonth() === month.getMonth() &&
            activityDate.getFullYear() === month.getFullYear() &&
            activity.status === "pending"
        )
      }).length

      monthsData.push({
        month: monthName,
        approved,
        rejected,
        pending,
      })
    }

    setMonthlyData(monthsData)
  }

  // 检查活动预警
  const checkActivityWarnings = (activities: any[]) => {
    const now = new Date()
    const warningsList = []

    // 检查即将开始但参与人数不足的活动
    for (const activity of activities) {
      const startTime = new Date(activity.startTime)
      const timeDiff = startTime.getTime() - now.getTime()
      const daysDiff = timeDiff / (1000 * 3600 * 24)

      // 活动将在3天内开始但参与人数不足最低要求的80%
      if (daysDiff > 0 && daysDiff <= 3 && activity.status === "approved") {
        if (activity.currentParticipants < activity.minParticipants * 0.8) {
          warningsList.push({
            id: activity.id,
            title: activity.title,
            type: "参与人数不足",
            message: `活动将在${Math.ceil(daysDiff)}天后开始，但当前仅有${activity.currentParticipants}人参与，未达到最低要求(${activity.minParticipants})的80%`,
            severity: "high",
          })
        }
      }

      // 活动地点变更但未通知参与者
      if (activity.locationChanged && !activity.participantsNotified) {
        warningsList.push({
          id: activity.id,
          title: activity.title,
          type: "地点变更",
          message: "活动地点已变更，但尚未通知参与者",
          severity: "medium",
        })
      }
    }

    setWarnings(warningsList)
  }

  const handleApprove = async (activityId: string, managerId: string) => {
    setProcessing(activityId)

    try {
      await updateActivity(activityId, {
        status: "approved",
        managerId,
      })

      // 更新活动列表
      setActivities(activities.filter((activity) => activity.id !== activityId))
      applyStatusFilter(
          activities.filter((activity) => activity.id !== activityId),
          statusFilter,
      )

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
      applyStatusFilter(
          activities.filter((activity) => activity.id !== activityId),
          statusFilter,
      )

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

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">活动申报审批</h1>
        <p className="text-muted-foreground">审批志愿活动申请</p>

        {/* 状态筛选 */}
        <div className="flex flex-wrap gap-2">
          <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => applyStatusFilter(activities, "all")}
              size="sm"
          >
            全部
          </Button>
          <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => applyStatusFilter(activities, "pending")}
              size="sm"
          >
            待审批
          </Button>
          <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              onClick={() => applyStatusFilter(activities, "approved")}
              size="sm"
          >
            已批准
          </Button>
          <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              onClick={() => applyStatusFilter(activities, "rejected")}
              size="sm"
          >
            已拒绝
          </Button>
        </div>

        {/* 活动预警 */}
        {warnings.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-orange-700">活动预警 ({warnings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {warnings.map((warning) => (
                      <div key={`${warning.id}-${warning.type}`} className="flex items-start gap-2 text-sm">
                        <Badge variant={warning.severity === "high" ? "destructive" : "outline"} className="mt-0.5">
                          {warning.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{warning.title}</p>
                          <p className="text-muted-foreground">{warning.message}</p>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        )}

        {/* 月度趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle>月度活动趋势</CardTitle>
            <CardDescription>过去6个月的活动审批情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 25,
                    }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" padding={{ left: 10, right: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                      type="monotone"
                      dataKey="approved"
                      name="已批准"
                      stroke="rgb(34, 197, 94)"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                  />
                  <Line
                      type="monotone"
                      dataKey="rejected"
                      name="已拒绝"
                      stroke="rgb(248, 113, 113)"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                  />
                  <Line
                      type="monotone"
                      dataKey="pending"
                      name="待审批"
                      stroke="rgb(250, 204, 21)"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 活动列表 */}
        {loading ? (
            <div className="flex justify-center items-center h-64">加载中...</div>
        ) : filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => (
                  <Card key={activity.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="line-clamp-1">{activity.title}</CardTitle>
                          <CardDescription className="mt-2 text-base">{activity.type}类</CardDescription>
                        </div>
                        <Badge
                            variant={
                              activity.status === "approved"
                                  ? "default"
                                  : activity.status === "rejected"
                                      ? "destructive"
                                      : "outline"
                            }
                        >
                          {activity.status === "approved" ? "已批准" : activity.status === "rejected" ? "已拒绝" : "待审批"}
                        </Badge>
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
                        参与人数: {activity.currentParticipants || 0}/{activity.minParticipants} -{" "}
                              {activity.maxParticipants}人
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
                    {activity.status === "pending" && (
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
                    )}
                  </Card>
              ))}
            </div>
        ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">
                暂无
                {statusFilter !== "all"
                    ? statusFilter === "pending"
                        ? "待审批的"
                        : statusFilter === "approved"
                            ? "已批准的"
                            : "已拒绝的"
                    : ""}
                活动
              </h3>
              <p className="text-muted-foreground mt-1">
                {statusFilter !== "all" ? "请尝试切换其他状态查看" : "当有新的活动申请时会显示在这里"}
              </p>
            </div>
        )}
      </div>
  )
}
