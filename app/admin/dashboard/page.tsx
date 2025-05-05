"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Clock, Edit, Filter, CalendarFold, Plus, Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getTasks, getAnnouncements, updateTask, deleteAnnouncement, getCurrentUser } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export default function AdminDashboardPage() {
  const { toast } = useToast()

  // 状态管理
  const [tasks, setTasks] = useState<any[]>([])
  const [filteredTasks, setFilteredTasks] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 筛选状态
  const [searchTaskQuery, setSearchTaskQuery] = useState("")
  const [searchAnnouncementQuery, setSearchAnnouncementQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  // 对话框状态
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newAnnouncementOpen, setNewAnnouncementOpen] = useState(false)
  const [editAnnouncementOpen, setEditAnnouncementOpen] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null)

  // 表单状态
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "medium",
    dueDate: "",
  })

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetGroup: "all",
    important: false,
  })

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          // 获取任务和公告数据
          const [tasksData, announcementsData] = await Promise.all([getTasks(), getAnnouncements()])

          setTasks(tasksData)
          setFilteredTasks(tasksData)
          setAnnouncements(announcementsData)
          setFilteredAnnouncements(announcementsData)
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

  // 任务筛选
  useEffect(() => {
    // 筛选任务
    let result = [...tasks]

    // 搜索筛选
    if (searchTaskQuery) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTaskQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTaskQuery.toLowerCase()),
      )
    }

    // 状态筛选
    if (filterStatus !== "all") {
      result = result.filter((task) => (filterStatus === "completed" ? task.completed : !task.completed))
    }

    // 优先级筛选
    if (filterPriority !== "all") {
      result = result.filter((task) => task.priority === filterPriority)
    }

    setFilteredTasks(result)
  }, [searchTaskQuery, filterStatus, filterPriority, tasks])

  // 公告筛选
  useEffect(() => {
    // 筛选公告
    if (searchAnnouncementQuery) {
      const filtered = announcements.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchAnnouncementQuery.toLowerCase()) ||
          announcement.content.toLowerCase().includes(searchAnnouncementQuery.toLowerCase()),
      )
      setFilteredAnnouncements(filtered)
    } else {
      setFilteredAnnouncements(announcements)
    }
  }, [searchAnnouncementQuery, announcements])

  // 任务相关处理函数
  const handleCompleteTask = async (taskId: string) => {
    try {
      // 更新任务状态
      await updateTask(taskId, { completed: true })

      // 更新本地状态
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task)))

      toast({
        title: "任务已完成",
        description: "任务已标记为已完成",
      })
    } catch (error) {
      console.error("更新任务失败", error)
      toast({
        title: "更新任务失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleCreateTask = async () => {
    // 表单验证
    if (!newTask.title || !newTask.description || !newTask.assignee || !newTask.dueDate) {
      toast({
        title: "表单不完整",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    try {
      // 模拟创建任务
      const createdTask = {
        id: `task-${Date.now()}`,
        ...newTask,
        createdAt: new Date().toISOString(),
        completed: false,
      }

      // 更新本地状态
      setTasks([createdTask, ...tasks])

      // 重置表单
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        priority: "medium",
        dueDate: "",
      })

      // 关闭对话框
      setNewTaskOpen(false)

      toast({
        title: "任务已创建",
        description: "新任务已成功创建",
      })
    } catch (error) {
      console.error("创建任务失败", error)
      toast({
        title: "创建任务失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  // 公告相关处理函数
  const handleCreateAnnouncement = async () => {
    // 表单验证
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: "表单不完整",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    try {
      // 模拟创建公告
      const createdAnnouncement = {
        id: `announcement-${Date.now()}`,
        ...newAnnouncement,
        createdAt: new Date().toISOString(),
        createdBy: "当前管理员",
      }

      // 更新本地状态
      setAnnouncements([createdAnnouncement, ...announcements])

      // 重置表单
      setNewAnnouncement({
        title: "",
        content: "",
        targetGroup: "all",
        important: false,
      })

      // 关闭对话框
      setNewAnnouncementOpen(false)

      toast({
        title: "公告已发布",
        description: "新公告已成功发布",
      })
    } catch (error) {
      console.error("发布公告失败", error)
      toast({
        title: "发布公告失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleEditAnnouncement = async () => {
    if (!currentAnnouncement) return

    try {
      // 模拟更新公告
      const updatedAnnouncements = announcements.map((announcement) =>
        announcement.id === currentAnnouncement.id ? currentAnnouncement : announcement,
      )

      setAnnouncements(updatedAnnouncements)
      setEditAnnouncementOpen(false)

      toast({
        title: "公告已更新",
        description: "公告内容已成功更新",
      })
    } catch (error) {
      console.error("更新公告失败", error)
      toast({
        title: "更新公告失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      // 调用删除API
      await deleteAnnouncement(id)

      // 更新本地状态
      setAnnouncements(announcements.filter((announcement) => announcement.id !== id))

      toast({
        title: "公告已删除",
        description: "公告已成功删除",
      })
    } catch (error) {
      console.error("删除公告失败", error)
      toast({
        title: "删除公告失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  // 计算待处理和已完成的任务
  const pendingTasks = filteredTasks.filter((task) => !task.completed)
  const completedTasks = filteredTasks.filter((task) => task.completed)

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">管理员工作台</h1>
        <div className="flex gap-2">
          <Dialog open={newAnnouncementOpen} onOpenChange={setNewAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setNewAnnouncementOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                发布公告
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>发布新公告</DialogTitle>
                <DialogDescription>创建新公告并发布给所有用户</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">公告标题</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    placeholder="输入公告标题"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">公告内容</Label>
                  <Textarea
                    id="content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    placeholder="输入公告详细内容"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewAnnouncementOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateAnnouncement}>发布公告</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审批活动</CardTitle>
            <Badge>1</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1个</div>
            <p className="text-xs text-muted-foreground">
              较上周 <span className="text-green-500">-2</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审批证明</CardTitle>
            <Badge>0</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0个</div>
            <p className="text-xs text-muted-foreground">
              较上周 <span className="text-green-500">-3</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活动预警</CardTitle>
            <Badge variant="destructive">2</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2个</div>
            <p className="text-xs text-muted-foreground">
              较上周 <span className="text-red-500">+1</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总志愿者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">158人</div>
            <p className="text-xs text-muted-foreground">
              较上月 <span className="text-green-500">+24</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">待办事项</TabsTrigger>
          <TabsTrigger value="announcements">公告管理</TabsTrigger>
        </TabsList>

        {/* 待办事项标签内容 */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                className="pl-8"
                value={searchTaskQuery}
                onChange={(e) => setSearchTaskQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="pending" className="mt-2">
            <TabsList>
              <TabsTrigger value="pending">待处理 ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">已完成 ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              {pendingTasks.length > 0 ? (
                <div className="space-y-4">
                  {pendingTasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              {task.title}
                              {task.priority === "high" && (
                                <Badge variant="destructive" className="ml-2">
                                  高优先级
                                </Badge>
                              )}
                            </CardTitle>
                            {task.dueDate && (
                              <CardDescription className="mt-4">
                                截止日期: {new Date(task.dueDate).toLocaleDateString("zh-CN")}
                                {new Date(task.dueDate) < new Date() && (
                                  <span className="text-destructive ml-2">已逾期</span>
                                )}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>创建于: {new Date(task.createdAt).toLocaleDateString("zh-CN")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <h3 className="text-lg font-medium">暂无待处理任务</h3>
                  <p className="text-muted-foreground mt-1">当前没有需要处理的任务</p>
                  <div className="mt-4">
                    <Button onClick={() => setNewTaskOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      创建任务
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {completedTasks.length > 0 ? (
                <div className="space-y-4">
                  {completedTasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{task.title}</CardTitle>
                            {task.dueDate && (
                              <CardDescription>
                                截止日期: {new Date(task.dueDate).toLocaleDateString("zh-CN")}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            已完成
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>完成于: {new Date().toLocaleDateString("zh-CN")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <h3 className="text-lg font-medium">暂无已完成任务</h3>
                  <p className="text-muted-foreground mt-1">当前没有已��成的任务</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 公告管理标签内容 */}
        <TabsContent value="announcements" className="space-y-4 mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索公告..."
              className="pl-8"
              value={searchAnnouncementQuery}
              onChange={(e) => setSearchAnnouncementQuery(e.target.value)}
            />
          </div>

          {filteredAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CalendarFold className="mr-2 h-5 w-5 text-primary" />
                        <CardTitle>{announcement.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>发布时间: {new Date(announcement.createdAt).toLocaleDateString("zh-CN")}</span>
                        </div>
                        <div>发布者: {announcement.createdBy || "系统管理员"}</div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm whitespace-pre-line">{announcement.content}</p>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentAnnouncement(announcement)
                        setEditAnnouncementOpen(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      编辑
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>您确定要删除这条公告吗？此操作无法撤销。</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAnnouncement(announcement.id)}>
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无公告</h3>
              <p className="text-muted-foreground mt-1">当前没有任何系统公告</p>
              <div className="mt-4">
                <Button onClick={() => setNewAnnouncementOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  发布公告
                </Button>
              </div>
            </div>
          )}

          {/* 编辑公告对话框 */}
          {currentAnnouncement && (
            <Dialog open={editAnnouncementOpen} onOpenChange={setEditAnnouncementOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>编辑公告</DialogTitle>
                  <DialogDescription>修改公告内容和设置</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">公告标题</Label>
                    <Input
                      id="edit-title"
                      value={currentAnnouncement.title}
                      onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, title: e.target.value })}
                      placeholder="输入公告标题"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-content">公告内容</Label>
                    <Textarea
                      id="edit-content"
                      value={currentAnnouncement.content}
                      onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, content: e.target.value })}
                      placeholder="输入公告详细内容"
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditAnnouncementOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleEditAnnouncement}>保存修改</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
