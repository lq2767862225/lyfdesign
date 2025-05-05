"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, MessageSquare, Users, Trash2 } from "lucide-react"
import {getActivities, getCurrentUser, updateActivity, deleteActivity, getUsers} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const activityFormSchema = z.object({
  title: z.string().min(2, { message: "活动名称至少需要2个字符" }),
  description: z.string().min(10, { message: "活动描述至少需要10个字符" }),
  type: z.string(),
  location: z.string().min(2, { message: "活动地点至少需要2个字符" }),
  startTime: z.string(),
  endTime: z.string(),
  maxParticipants: z.coerce.number().int().positive({ message: "参与人数必须为正整数" }),
})

export default function MyActivitiesPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVolunteersDialogOpen, setIsVolunteersDialogOpen] = useState(false)
  const [selectedVolunteers, setSelectedVolunteers] = useState<any[]>([])

  const form = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      location: "",
      startTime: "",
      endTime: "",
      maxParticipants: 0,
    },
  })

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

  useEffect(() => {
    if (selectedActivity) {
      // 格式化日期时间为HTML datetime-local格式 (YYYY-MM-DDThh:mm)
      const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
      }

      form.reset({
        title: selectedActivity.title,
        description: selectedActivity.description,
        type: selectedActivity.type,
        location: selectedActivity.location,
        startTime: formatDateTime(selectedActivity.startTime),
        endTime: formatDateTime(selectedActivity.endTime),
        maxParticipants: selectedActivity.maxParticipants,
      })
    }
  }, [selectedActivity, form])

  const handleViewDetails = (activity: any) => {
    setSelectedActivity(activity)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (activityId: string) => {
    try {
      setIsDeleting(true)
      await deleteActivity(activityId)
      toast({
        title: "删除成功",
        description: "活动已成功删除",
      })
      // 重新获取活动列表
      const user = await getCurrentUser()
      if (user) {
        const activitiesData = await getActivities()
        const myActivities = activitiesData.filter((activity: any) => activity.managerId === user.id)
        setActivities(myActivities)
      }
    } catch (error) {
      console.error("删除活动失败", error)
      toast({
        title: "删除活动失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return

    setIsSubmitting(true)
    try {
      await deleteActivity(selectedActivity.id)

      // 更新本地状态，移除已删除的活动
      setActivities(activities.filter((activity) => activity.id !== selectedActivity.id))

      toast({
        title: "删除成功",
        description: "活动已成功删除",
      })

      setIsDetailsOpen(false)
      setIsDeleteAlertOpen(false)
    } catch (error) {
      console.error("删除活动失败", error)
      toast({
        title: "删除失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewVolunteers = async (activity: any) => {
    const users = await getUsers();

    setSelectedActivity(activity)
    setSelectedVolunteers(activity.participants.map((participant: string) => {
      return users.find(({id}) => id === participant)
    }) || [])
    setIsVolunteersDialogOpen(true)
  }

  const onSubmit = async (data: z.infer<typeof activityFormSchema>) => {
    if (!selectedActivity) return

    setIsSubmitting(true)
    try {
      const updatedActivity = await updateActivity(selectedActivity.id, {
        ...data,
        status: selectedActivity.status,
        managerId: selectedActivity.managerId,
        participants: selectedActivity.participants,
      })

      // 更新本地状态
      setActivities(activities.map((activity) => (activity.id === selectedActivity.id ? updatedActivity : activity)))

      toast({
        title: "更新成功",
        description: "活动信息已成功更新",
      })

      setIsDetailsOpen(false)
    } catch (error) {
      console.error("更新活动失败", error)
      toast({
        title: "更新失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
                          <CardTitle className="mb-2">{activity.title}</CardTitle>
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
                      <Button variant="outline" onClick={() => handleViewVolunteers(activity)}>
                        <Users className="mr-2 h-4 w-4" />
                        查看志愿者
                      </Button>
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
                      {activity.status === "pending" && <Button onClick={() => handleViewDetails(activity)}>编辑活动</Button>}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              您确定要删除此活动吗？此操作无法撤销，所有相关数据将被永久删除。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(activity.id)} disabled={isDeleting}>
                              {isDeleting ? "删除中..." : "确认删除"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

        {/* 查看详情对话框 */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>活动详情</DialogTitle>
              <DialogDescription>查看和修改活动信息，修改后点击保存按钮提交更改。</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>活动名称</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>活动描述</FormLabel>
                          <FormControl>
                            <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>活动类型</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择活动类型" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="环境保护">环境保护</SelectItem>
                                <SelectItem value="关怀老人">关怀老人</SelectItem>
                                <SelectItem value="校园活动">校园活动</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>活动地点</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>开始时间</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>结束时间</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

                <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>最大参与人数</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                {selectedActivity && (
                    <div className="pt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        <span>当前已报名: {selectedActivity.participants?.length || 0} 人</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Badge
                            className={
                              selectedActivity.status === "pending"
                                  ? "bg-yellow-500"
                                  : selectedActivity.status === "approved"
                                      ? "bg-green-500"
                                      : selectedActivity.status === "rejected"
                                          ? "bg-red-500"
                                          : selectedActivity.status === "completed"
                                              ? "bg-blue-500"
                                              : "bg-gray-500"
                            }
                        >
                          {selectedActivity.status === "pending"
                              ? "待审批"
                              : selectedActivity.status === "approved"
                                  ? "已审批"
                                  : selectedActivity.status === "rejected"
                                      ? "已拒绝"
                                      : selectedActivity.status === "completed"
                                          ? "已完成"
                                          : "已取消"}
                        </Badge>
                      </div>
                    </div>
                )}

                <DialogFooter className="flex justify-between items-center pt-4">
                  <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setIsDeleteAlertOpen(true)}
                      disabled={isSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除活动
                  </Button>
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        取消
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "保存中..." : "保存更改"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除活动</AlertDialogTitle>
              <AlertDialogDescription>此操作不可撤销。这将永久删除该活动及其所有相关数据。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDeleteActivity}
                  disabled={isSubmitting}
                  className="bg-red-500 hover:bg-red-600"
              >
                {isSubmitting ? "删除中..." : "确认删除"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 志愿者列表对话框 */}
        <Dialog open={isVolunteersDialogOpen} onOpenChange={setIsVolunteersDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>活动参与志愿者</DialogTitle>
              <DialogDescription>
                {selectedActivity ? `"${selectedActivity.title}" 的参与志愿者列表` : "参与志愿者列表"}
              </DialogDescription>
            </DialogHeader>

            {selectedVolunteers.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">志愿者</TableHead>
                        <TableHead className="text-center">学号</TableHead>
                        <TableHead className="text-center">院系</TableHead>
                        <TableHead className="text-center">联系方式</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedVolunteers.map((volunteer) => (
                          <TableRow key={volunteer.id}>
                            <TableCell>
                              <div className="flex items-center gap-2 justify-center">
                                <div>
                                  <p className="font-medium">{volunteer.name}</p>
                                  <p className="text-xs text-muted-foreground">{volunteer.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{volunteer.studentId}</TableCell>
                            <TableCell className="text-center">
                              {volunteer.department}
                            </TableCell>
                            <TableCell className="text-center">
                              {volunteer.phone || volunteer.email || "未提供"}
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-2 text-lg font-medium">暂无志愿者</h3>
                  <p className="text-sm text-muted-foreground mt-1">该活动目前没有志愿者报名参与</p>
                </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVolunteersDialogOpen(false)}>
                关闭
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
