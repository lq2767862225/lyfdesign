"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Download, Eye, FileText, MapPin, Search, Users } from "lucide-react"
import { getActivities } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

export default function AdminActivityHistoryPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [filteredActivities, setFilteredActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterYear, setFilterYear] = useState("all")
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesData = await getActivities()
        // 筛选出已完成的活动
        const completedActivities = activitiesData.filter(
          (activity: any) => activity.endTime && new Date(activity.endTime) < new Date(),
        )

        // 按结束时间降序排序
        completedActivities.sort((a: any, b: any) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())

        setActivities(completedActivities)
        setFilteredActivities(completedActivities)

        // 提取可用的年份和活动类型
        const years = Array.from(
          new Set(completedActivities.map((activity: any) => new Date(activity.endTime).getFullYear().toString())),
        ).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))

        const types = Array.from(new Set(completedActivities.map((activity: any) => activity.type)))

        setAvailableYears(years)
        setAvailableTypes(types)
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
    // 根据搜索和筛选条件过滤活动
    let filtered = [...activities]

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // 类型筛选
    if (filterType !== "all") {
      filtered = filtered.filter((activity) => activity.type === filterType)
    }

    // 年份筛选
    if (filterYear !== "all") {
      filtered = filtered.filter((activity) => new Date(activity.endTime).getFullYear().toString() === filterYear)
    }

    setFilteredActivities(filtered)
  }, [searchQuery, filterType, filterYear, activities])

  const generateReport = (activity: any) => {
    toast({
      title: "报告生成中",
      description: "活动报告正在生成，请稍候...",
    })

    // 模拟报告生成
    setTimeout(() => {
      toast({
        title: "报告已生成",
        description: "活动报告已成功生成，可以下载",
      })
    }, 1500)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">活动总览</h1>
          <p className="text-muted-foreground mt-1">查看所有活动的记录和统计数据</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          导出数据
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索活动..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="活动类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有类型</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="年份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有年份</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">列表视图</TabsTrigger>
          <TabsTrigger value="grid">网格视图</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{activity.title}</CardTitle>
                        <CardDescription>{activity.type}类</CardDescription>
                      </div>
                      <Badge variant="outline">已完成</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">{activity.description}</p>

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
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-4 w-4" />
                          <span>
                            参与人数: {activity.participants.length}/{activity.maxParticipants}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm font-medium text-green-600">
                        <FileText className="mr-1 h-4 w-4" />
                        <span>服务时长: {activity.serviceHours} 小时</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateReport(activity)}>
                      <Download className="mr-2 h-4 w-4" />
                      生成报告
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedActivity(activity)
                        setViewDetailsOpen(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      查看详情
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无活动记录</h3>
              <p className="text-muted-foreground mt-1">没有找到符合条件的活动记录</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="grid" className="mt-4">
          {filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <Badge variant="outline">已完成</Badge>
                    </div>
                    <CardDescription>{activity.type}类活动</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>{new Date(activity.startTime).toLocaleDateString("zh-CN")}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        <span>
                          参与人数: {activity.participants.length}/{activity.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <FileText className="mr-1 h-4 w-4" />
                        <span>服务时长: {activity.serviceHours} 小时</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0 mt-auto">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedActivity(activity)
                        setViewDetailsOpen(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      查看详情
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无活动记录</h3>
              <p className="text-muted-foreground mt-1">没有找到符合条件的活动记录</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 查看详情对话框 */}
      {selectedActivity && (
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>活动详情</DialogTitle>
              <DialogDescription>查看活动详细信息和统计数据</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium">基本信息</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">活动名称:</span> {selectedActivity.title}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">活动类型:</span> {selectedActivity.type}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">开始时间:</span>{" "}
                    {new Date(selectedActivity.startTime).toLocaleString("zh-CN")}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">结束时间:</span>{" "}
                    {new Date(selectedActivity.endTime).toLocaleString("zh-CN")}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">活动地点:</span> {selectedActivity.location}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">服务时长:</span> {selectedActivity.serviceHours}小时
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">负责人:</span> {selectedActivity.managerId || "未指定"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">参与人数:</span> {selectedActivity.participants.length}/
                    {selectedActivity.maxParticipants}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium">活动描述</h3>
                <p className="text-sm mt-2 p-2 bg-muted rounded-md">{selectedActivity.description}</p>
              </div>

              <div>
                <h3 className="font-medium">参与志愿者</h3>
                <div className="mt-2 max-h-[150px] overflow-y-auto p-2 border rounded-md">
                  {selectedActivity.participants && selectedActivity.participants.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedActivity.participants.map((participantId: string, index: number) => (
                        <div key={index} className="text-sm p-1">
                          志愿者ID: {participantId}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">无参与志愿者</div>
                  )}
                </div>
              </div>

              {selectedActivity.materials && (
                <div>
                  <h3 className="font-medium">证明材料</h3>
                  <div className="space-y-2 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">上传时间:</span>{" "}
                      {new Date(selectedActivity.materials.uploadedAt).toLocaleString("zh-CN")}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">材料状态:</span>{" "}
                      {selectedActivity.materials.approved
                        ? "已通过"
                        : selectedActivity.materials.rejected
                          ? "已拒绝"
                          : "待审核"}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">文件数量:</span>{" "}
                      {selectedActivity.materials.files ? selectedActivity.materials.files.length : 0}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => generateReport(selectedActivity)}>
                <Download className="mr-2 h-4 w-4" />
                生成报告
              </Button>
              <Link href={`/admin/activities/materials`}>
                <Button>查看证明材料</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
