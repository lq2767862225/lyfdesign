"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Heart, MapPin, MessageSquare, Share2, Users } from "lucide-react"
import { getActivityById, joinActivity, getCurrentUser, getUsers } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ActivityDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [activity, setActivity] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activityId = params.id as string
        const activityData = await getActivityById(activityId)

        if (!activityData) {
          toast({
            title: "活动不存在",
            description: "您查找的活动不存在或已被删除",
            variant: "destructive",
          })
          router.push("/volunteer/activities/overview")
          return
        }

        setActivity(activityData)

        // 获取当前用户
        const user = await getCurrentUser()
        setCurrentUser(user)

        // 获取参与者信息
        if (activityData.participants && activityData.participants.length > 0) {
          const allUsers = await getUsers()
          const participantUsers = allUsers.filter((user: any) => activityData.participants.includes(user.id))
          setParticipants(participantUsers)
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
  }, [params.id, router, toast])

  const handleJoinActivity = async () => {
    if (!activity || !currentUser) return

    setJoining(true)

    try {
      const result = await joinActivity(activity.id, currentUser.id)

      if (result.success) {
        toast({
          title: "报名成功",
          description: "您已成功报名参加该活动",
        })

        // 更新活动信息
        setActivity({
          ...activity,
          participants: [...activity.participants, currentUser.id],
        })

        // 添加当前用户到参与者列表
        setParticipants([...participants, currentUser])
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

  const hasJoined = () => {
    return currentUser && activity && activity.participants.includes(currentUser.id)
  }

  const isBlacklisted = () => {
    return currentUser && currentUser.creditScore <= 0
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  if (!activity) {
    return <div className="flex justify-center items-center h-64">活动不存在</div>
  }

  const serviceHours =
    (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / (1000 * 60 * 60)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{activity.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Badge>{activity.type}类活动</Badge>
        {activity.isHot && <Badge variant="destructive">热门</Badge>}
        <Badge variant="outline" className="ml-auto">
          {activity.status === "pending"
            ? "待审批"
            : activity.status === "approved"
              ? "已审批"
              : activity.status === "completed"
                ? "已完成"
                : activity.status === "canceled"
                  ? "已取消"
                  : "已拒绝"}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">活动描述</h3>
                <p className="text-muted-foreground">{activity.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>活动日期: {new Date(activity.startTime).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      活动时间:{" "}
                      {new Date(activity.startTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}{" "}
                      -{new Date(activity.endTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
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
                      已报名: {activity.participants.length}/{activity.maxParticipants}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>服务时长: {serviceHours}小时</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>报名截止: {new Date(activity.registrationDeadline).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>
              </div>

              {!hasJoined() && activity.status === "approved" && (
                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={() => setDialogOpen(true)}
                    disabled={isBlacklisted() || activity.participants.length >= activity.maxParticipants}
                  >
                    立即报名
                  </Button>

                  {isBlacklisted() && (
                    <p className="text-sm text-destructive mt-2">您当前处于志愿黑名单中，无法报名活动</p>
                  )}

                  {activity.participants.length >= activity.maxParticipants && (
                    <p className="text-sm text-destructive mt-2">活动名额已满</p>
                  )}
                </div>
              )}

              {hasJoined() && (
                <div className="pt-4">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => router.push(`/volunteer/messages/groups`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    进入活动群聊
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">活动负责人</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/abstract-geometric-z.png" />
                      <AvatarFallback>ZX</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">张项目</p>
                      <p className="text-sm text-muted-foreground">志愿服务部</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">参与志愿者 ({participants.length})</TabsTrigger>
          <TabsTrigger value="materials">活动材料</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {participants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((user) => (
                    <div key={user.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">暂无志愿者报名参加</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {activity.materials ? (
                <div>
                  {/* 显示活动材料 */}
                  <p>活动材料内容</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">暂无活动材料</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认����名</DialogTitle>
            <DialogDescription>您确定要报名参加"{activity.title}"活动吗？</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              活动时间: {new Date(activity.startTime).toLocaleString("zh-CN")} 至{" "}
              {new Date(activity.endTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">活动地点: {activity.location}</p>
            <p className="text-sm text-muted-foreground mt-1">服务时长: {serviceHours} 小时</p>
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
