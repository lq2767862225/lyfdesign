"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Search, Filter, MoreHorizontal } from "lucide-react"
import { getActivities, updateActivity } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ActivityManagementPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [filteredActivities, setFilteredActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesData = await getActivities()
        setActivities(activitiesData)
        setFilteredActivities(activitiesData)
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
    let filtered = activities

    // 应用状态筛选
    if (statusFilter !== "all") {
      filtered = filtered.filter((activity) => activity.status === statusFilter)
    }

    // 应用类型筛选
    if (typeFilter !== "all") {
      filtered = filtered.filter((activity) => activity.type === typeFilter)
    }

    // 应用搜索筛选
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(query) ||
          activity.location.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query),
      )
    }

    setFilteredActivities(filtered)
  }, [searchQuery, statusFilter, typeFilter, activities])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
  }

  const handleViewDetails = (activity: any) => {
    setSelectedActivity(activity)
    setDialogOpen(true)
  }

  const handleCancelActivity = async () => {
    if (!selectedActivity) return

    try {
      await updateActivity(selectedActivity.id, {
        status: "cancelled",
      })

      // 更新活动列表
      const updatedActivities = activities.map((activity) =>
        activity.id === selectedActivity.id ? { ...activity, status: "cancelled" } : activity,
      )
      setActivities(updatedActivities)

      toast({
        title: "活动已取消",
        description: "活动状态已更新���已取消",
      })

      setCancelDialogOpen(false)
    } catch (error) {
      console.error("取消活动失败", error)
      toast({
        title: "操作失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            待审批
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            已审批
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            已拒绝
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            已完成
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            已取消
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  // 获取所有活动类型
  const activityTypes = Array.from(new Set(activities.map((activity) => activity.type)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">活动管理</h1>
        <Badge>{activities.length}</Badge>
      </div>
      <p className="text-muted-foreground">管理所有志愿服务活动</p>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索活动名称、地点或描述..."
            value={searchQuery}
            onChange={handleSearch}
            className="flex-1"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="pending">待审批</SelectItem>
                <SelectItem value="approved">已审批</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">网格视图</TabsTrigger>
          <TabsTrigger value="list">列表视图</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="w-full">
          {filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">{activity.title}</CardTitle>
                        <CardDescription>{activity.type}类活动</CardDescription>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
                    <div className="space-y-2">
                      <p className="text-sm line-clamp-2">{activity.description}</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{new Date(activity.startTime).toLocaleDateString("zh-CN")}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
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
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {activity.participants?.length || 0}/{activity.maxParticipants}人
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full" onClick={() => handleViewDetails(activity)}>
                      查看详情
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">未找到匹配的活动</h3>
              <p className="text-muted-foreground mt-1">请尝试调整筛选条件</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="w-full">
          {filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{activity.title}</CardTitle>
                        <CardDescription>{activity.type}类活动</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(activity.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">操作菜单</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(activity)}>查看详情</DropdownMenuItem>
                            {activity.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedActivity(activity)
                                  setCancelDialogOpen(true)
                                }}
                                className="text-red-600"
                              >
                                取消活动
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm">{activity.description}</p>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>活动日期: {new Date(activity.startTime).toLocaleDateString("zh-CN")}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
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
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>活动地点: {activity.location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            参与人数: {activity.participants?.length || 0}/{activity.maxParticipants}人
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            服务时长:{" "}
                            {(new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) /
                              (1000 * 60 * 60)}
                            小时
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">未找到匹配的活动</h3>
              <p className="text-muted-foreground mt-1">请尝试调整筛选条件</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 活动详情对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>活动详情</DialogTitle>
            <DialogDescription>查看活动的详细信息</DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{selectedActivity.title}</h3>
                <div className="flex items-center">
                  <Badge className="mr-2">{selectedActivity.type}类活动</Badge>
                  {getStatusBadge(selectedActivity.status)}
                </div>
              </div>

              <div className="space-y-2">
                <p>{selectedActivity.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>活动日期: {new Date(selectedActivity.startTime).toLocaleDateString("zh-CN")}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
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
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>活动地点: {selectedActivity.location}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        参与人数: {selectedActivity.participants?.length || 0}/{selectedActivity.maxParticipants}人
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        服务时长:{" "}
                        {(new Date(selectedActivity.endTime).getTime() -
                          new Date(selectedActivity.startTime).getTime()) /
                          (1000 * 60 * 60)}
                        小时
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        报名��止: {new Date(selectedActivity.registrationDeadline).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              关闭
            </Button>
            {selectedActivity && selectedActivity.status === "approved" && (
              <Button
                variant="destructive"
                onClick={() => {
                  setDialogOpen(false)
                  setCancelDialogOpen(true)
                }}
              >
                取消活动
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 取消活动确认对话框 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>取消活动</DialogTitle>
            <DialogDescription>确认取消此活动</DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="py-4">
              <p>
                您确定要取消活动 <span className="font-bold">{selectedActivity.title}</span>{" "}
                吗？此操作将通知所有已报名的志愿者。
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              返回
            </Button>
            <Button variant="destructive" onClick={handleCancelActivity}>
              确认取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
