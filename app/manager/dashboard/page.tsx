"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Clock, FileText, Filter, Info, Plus, Search, Upload } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTasks, getAnnouncements, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ManagerDashboardPage() {
  const { toast } = useToast()

  // 任务状态
  const [tasks, setTasks] = useState<any[]>([])
  const [taskSearch, setTaskSearch] = useState("")
  const [taskFilter, setTaskFilter] = useState("all")
  const [taskLoading, setTaskLoading] = useState(true)

  // 公告状态
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [announcementSearch, setAnnouncementSearch] = useState("")
  const [announcementLoading, setAnnouncementLoading] = useState(true)

  // 图表数据
  const activityTypeData = [
    { name: "环保", value: 50 },
    { name: "关爱", value: 50 },
  ]

  const COLORS = ["#4f46e5", "#0ea5e9"]

  const volunteerParticipationData = [
    { name: "李志愿", count: 2 },
    { name: "王小明", count: 1 },
  ]

  const serviceHoursData = [
    { name: "校园环保", hours: 4 },
    { name: "敬老院", hours: 3 },
  ]

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          // 获取任务
          setTaskLoading(true)
          const tasksData = await getTasks(user.id)
          setTasks(tasksData)
          setTaskLoading(false)

          // 获取公告
          setAnnouncementLoading(true)
          const announcementsData = await getAnnouncements()
          setAnnouncements(announcementsData)
          setAnnouncementLoading(false)
        }
      } catch (error) {
        console.error("获取数据失败", error)
        toast({
          title: "获取数据失败",
          description: "请稍后再试",
          variant: "destructive",
        })
        setTaskLoading(false)
        setAnnouncementLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // 任务筛选逻辑
  const filteredTasks = tasks
    .filter((task) => {
      if (taskFilter === "all") return true
      if (taskFilter === "pending") return !task.completed
      if (taskFilter === "completed") return task.completed
      return true
    })
    .filter(
      (task) =>
        task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        task.description.toLowerCase().includes(taskSearch.toLowerCase()),
    )

  // 公告筛选逻辑
  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
      announcement.content.toLowerCase().includes(announcementSearch.toLowerCase()),
  )

  // 完成任务
  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task)))

    toast({
      title: "任务已完成",
      description: "任务已标记为已完成",
    })
  }

  // 自定���工具提示
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded-md shadow-sm">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">负责人工作台</h1>
        <div className="flex gap-2">
          <Link href="/manager/activities/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              申报活动
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">我负责的活动</CardTitle>
            <Badge>2</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2个</div>
            <p className="text-xs text-muted-foreground">
              较上周 <span className="text-green-500">+1</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待上传证明</CardTitle>
            <Badge>1</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1个</div>
            <p className="text-xs text-muted-foreground">
              较上周 <span className="text-red-500">+1</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参与志愿者</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3人</div>
            <p className="text-xs text-muted-foreground">
              较上周 <span className="text-green-500">+2</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总服务时长</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7小时</div>
            <p className="text-xs text-muted-foreground">
              较上周 <span className="text-green-500">+3</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 - 删除"我的活动"，只保留"待办事项"和"公告" */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">待办事项</TabsTrigger>
          <TabsTrigger value="announcements">公告</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="筛选任务" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有任务</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>

          {taskLoading ? (
            <div className="flex justify-center items-center h-64">加载中...</div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{task.title}</CardTitle>
                      {task.completed ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          已完成
                        </Badge>
                      ) : task.dueDate && new Date(task.dueDate) < new Date() ? (
                        <Badge variant="destructive">已逾期</Badge>
                      ) : (
                        <Badge variant="outline">待处理</Badge>
                      )}
                    </div>
                    {task.dueDate && (
                      <CardDescription>截止日期: {new Date(task.dueDate).toLocaleDateString("zh-CN")}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      {task.completed ? (
                        <>
                          <Clock className="mr-1 h-3 w-3" />
                          <span>完成于: {new Date().toLocaleDateString("zh-CN")}</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>创建于: {new Date(task.createdAt).toLocaleDateString("zh-CN")}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                  {!task.completed && (
                      <div className="px-6 pb-4 flex justify-end gap-2">
                      {task.title.includes("上传") && (
                        <Link href="/manager/activities/materials">
                          <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            上传材料
                          </Button>
                        </Link>
                      )}
                      </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无任务</h3>
              <p className="text-muted-foreground mt-1">
                {taskSearch ? "没有找到匹配的任务" : "您当前没有需要处理的任务"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索公告..."
                value={announcementSearch}
                onChange={(e) => setAnnouncementSearch(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {announcementLoading ? (
            <div className="flex justify-center items-center h-64">加载中...</div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Info className="mr-2 h-5 w-5 text-primary" />
                        <CardTitle>{announcement.title}</CardTitle>
                      </div>
                      {announcement.important && <Badge>重要</Badge>}
                    </div>
                    <CardDescription>
                      <div className="flex items-center mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>{new Date(announcement.createdAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{announcement.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无公告</h3>
              <p className="text-muted-foreground mt-1">
                {announcementSearch ? "没有找到匹配的公告" : "当前没有任何系统公告"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
