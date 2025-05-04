"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Download, Eye, FileText, Search, X } from "lucide-react"
import { getActivities, approveActivityMaterials, rejectActivityMaterials } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminActivityMaterialsPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [filteredActivities, setFilteredActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("pending")
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesData = await getActivities()
        // 筛选出已上传材料的活动
        const activitiesWithMaterials = activitiesData.filter(
          (activity: any) => activity.materials && activity.endTime && new Date(activity.endTime) < new Date(),
        )
        setActivities(activitiesWithMaterials)

        // 默认显示待审核的材料
        const pendingActivities = activitiesWithMaterials.filter(
          (activity: any) => activity.materials && !activity.materials.approved && !activity.materials.rejected,
        )
        setFilteredActivities(pendingActivities)
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
          (activity.materials.description &&
            activity.materials.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // 状态筛选
    if (filterStatus === "pending") {
      filtered = filtered.filter(
        (activity) => activity.materials && !activity.materials.approved && !activity.materials.rejected,
      )
    } else if (filterStatus === "approved") {
      filtered = filtered.filter((activity) => activity.materials && activity.materials.approved)
    } else if (filterStatus === "rejected") {
      filtered = filtered.filter((activity) => activity.materials && activity.materials.rejected)
    }

    setFilteredActivities(filtered)
  }, [searchQuery, filterStatus, activities])

  const handleApproveMaterials = async (activityId: string) => {
    try {
      // 调用审批API
      await approveActivityMaterials(activityId)

      // 更新本地状态
      setActivities(
        activities.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                materials: {
                  ...activity.materials,
                  approved: true,
                  rejected: false,
                  approvedAt: new Date().toISOString(),
                  approvedBy: "当前管理员",
                },
              }
            : activity,
        ),
      )

      // 关闭详情对话框
      setViewDetailsOpen(false)

      toast({
        title: "材料已审批",
        description: "活动证明材料已成功审批通过",
      })
    } catch (error) {
      console.error("审批失败", error)
      toast({
        title: "审批失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleRejectMaterials = async (activityId: string) => {
    if (!rejectReason) {
      toast({
        title: "请填写拒绝原因",
        description: "拒绝审批时必须提供原因",
        variant: "destructive",
      })
      return
    }

    try {
      // 调用拒绝API
      await rejectActivityMaterials(activityId, rejectReason)

      // 更新本地状态
      setActivities(
        activities.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                materials: {
                  ...activity.materials,
                  approved: false,
                  rejected: true,
                  rejectedAt: new Date().toISOString(),
                  rejectedBy: "当前管理员",
                  rejectionReason: rejectReason,
                },
              }
            : activity,
        ),
      )

      // 关闭对话框
      setRejectDialogOpen(false)
      setViewDetailsOpen(false)
      setRejectReason("")

      toast({
        title: "材料已拒绝",
        description: "活动证明材料已被拒绝",
      })
    } catch (error) {
      console.error("拒绝失败", error)
      toast({
        title: "操作失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">活动证明材料审核</h1>
          <p className="text-muted-foreground mt-1">审核活动证明材料，确认志愿服务时长</p>
        </div>
        <Badge variant={filterStatus === "pending" ? "destructive" : "outline"}>
          {filterStatus === "pending" && filteredActivities.length > 0 ? `${filteredActivities.length}个待审核` : ""}
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索活动或材料..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">待审核</SelectItem>
            <SelectItem value="approved">已通过</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
            <SelectItem value="all">全部</SelectItem>
          </SelectContent>
        </Select>
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
                        <CardDescription>
                          活动时间: {new Date(activity.startTime).toLocaleDateString("zh-CN")} -
                          {new Date(activity.endTime).toLocaleDateString("zh-CN")}
                        </CardDescription>
                      </div>
                      {activity.materials.approved ? (
                        <Badge className="bg-green-50 text-green-700 border-green-200">已通过</Badge>
                      ) : activity.materials.rejected ? (
                        <Badge variant="destructive">已拒绝</Badge>
                      ) : (
                        <Badge variant="outline">待审核</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="mr-1 h-4 w-4" />
                        <span>材料描述: {activity.materials.description || "无描述"}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>上传时间: {new Date(activity.materials.uploadedAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                      {activity.materials.files && (
                        <div className="text-sm text-muted-foreground">
                          上传文件: {activity.materials.files.length}个文件
                        </div>
                      )}
                      {activity.materials.approved && (
                        <div className="flex items-center text-sm text-green-600">
                          <Check className="mr-1 h-4 w-4" />
                          <span>
                            审批通过时间: {new Date(activity.materials.approvedAt).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                      )}
                      {activity.materials.rejected && (
                        <div className="flex items-center text-sm text-destructive">
                          <X className="mr-1 h-4 w-4" />
                          <span>拒绝原因: {activity.materials.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedActivity(activity)
                        setViewDetailsOpen(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      查看详情
                    </Button>
                    {!activity.materials.approved && !activity.materials.rejected && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedActivity(activity)
                            setRejectDialogOpen(true)
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          拒绝
                        </Button>
                        <Button size="sm" onClick={() => handleApproveMaterials(activity.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          通过
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">
                暂无
                {filterStatus === "pending"
                  ? "待审核"
                  : filterStatus === "approved"
                    ? "已通过"
                    : filterStatus === "rejected"
                      ? "已拒绝"
                      : ""}
                材料
              </h3>
              <p className="text-muted-foreground mt-1">
                {filterStatus === "pending"
                  ? "当前没有待审核的活动证明材料"
                  : filterStatus === "approved"
                    ? "当前没有已通过的活动证明材料"
                    : filterStatus === "rejected"
                      ? "当前没有已拒绝的活动证明材料"
                      : "没有找到符合条件的活动证明材料"}
              </p>
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
                      {activity.materials.approved ? (
                        <Badge className="bg-green-50 text-green-700 border-green-200">已通过</Badge>
                      ) : activity.materials.rejected ? (
                        <Badge variant="destructive">已拒绝</Badge>
                      ) : (
                        <Badge variant="outline">待审核</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        材料描述: {activity.materials.description || "无描述"}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>上传: {new Date(activity.materials.uploadedAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                      {activity.materials.files && (
                        <div className="text-xs text-muted-foreground">文件数: {activity.materials.files.length}</div>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0 mt-auto">
                    <Button
                      variant="outline"
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
              <h3 className="text-lg font-medium">
                暂无
                {filterStatus === "pending"
                  ? "待审核"
                  : filterStatus === "approved"
                    ? "已通过"
                    : filterStatus === "rejected"
                      ? "已拒绝"
                      : ""}
                材料
              </h3>
              <p className="text-muted-foreground mt-1">
                {filterStatus === "pending"
                  ? "当前没有待审核的活动证明材料"
                  : filterStatus === "approved"
                    ? "当��没有已通过的活动证明材料"
                    : filterStatus === "rejected"
                      ? "当前没有已拒绝的活动证明材料"
                      : "没有找到符合条件的活动证明材料"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 查看详情对话框 */}
      {selectedActivity && (
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>活动证明材料详情</DialogTitle>
              <DialogDescription>查看活动证明材料详细信息</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium">活动信息</h3>
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
                </div>
              </div>

              <div>
                <h3 className="font-medium">材料信息</h3>
                <div className="space-y-2 mt-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">上传时间:</span>{" "}
                    {new Date(selectedActivity.materials.uploadedAt).toLocaleString("zh-CN")}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">上传者:</span> {selectedActivity.managerId || "未知"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">材料描述:</span>
                    <p className="mt-1 p-2 bg-muted rounded-md">{selectedActivity.materials.description || "无描述"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium">上传文件</h3>
                <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                  {selectedActivity.materials.files && selectedActivity.materials.files.length > 0 ? (
                    selectedActivity.materials.files.map((file: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">无上传文件</div>
                  )}
                </div>
              </div>

              {selectedActivity.materials.approved && (
                <div>
                  <h3 className="font-medium text-green-600">审批信息</h3>
                  <div className="space-y-2 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">审批时间:</span>{" "}
                      {new Date(selectedActivity.materials.approvedAt).toLocaleString("zh-CN")}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">审批人:</span>{" "}
                      {selectedActivity.materials.approvedBy || "系统管理员"}
                    </div>
                  </div>
                </div>
              )}

              {selectedActivity.materials.rejected && (
                <div>
                  <h3 className="font-medium text-destructive">拒绝信息</h3>
                  <div className="space-y-2 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">拒绝时间:</span>{" "}
                      {new Date(selectedActivity.materials.rejectedAt).toLocaleString("zh-CN")}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">拒绝人:</span>{" "}
                      {selectedActivity.materials.rejectedBy || "系统管理员"}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">拒绝原因:</span>
                      <p className="mt-1 p-2 bg-red-50 text-red-800 rounded-md">
                        {selectedActivity.materials.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              {!selectedActivity.materials.approved && !selectedActivity.materials.rejected && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setRejectDialogOpen(true)
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    拒绝
                  </Button>
                  <Button onClick={() => handleApproveMaterials(selectedActivity.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    通过
                  </Button>
                </>
              )}
              {(selectedActivity.materials.approved || selectedActivity.materials.rejected) && (
                <Button onClick={() => setViewDetailsOpen(false)}>关闭</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 拒绝原因对话框 */}
      {selectedActivity && (
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>拒绝材料</AlertDialogTitle>
              <AlertDialogDescription>请填写拒绝原因，该原因将发送给活动负责人</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="请输入拒绝原因..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRejectReason("")}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleRejectMaterials(selectedActivity.id)}>确认拒绝</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
