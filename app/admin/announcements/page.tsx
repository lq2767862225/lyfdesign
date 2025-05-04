"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, AlertCircle, Calendar, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 模拟API调用
const getAnnouncements = async () => {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "1",
      title: "志愿者管理系统正式上线",
      content: "我校志愿者管理系统已正式上线，请各位志愿者及时注册并完善个人信息。",
      publishDate: "2025-04-15",
      target: "all",
      important: true,
      visible: true,
    },
    {
      id: "2",
      title: "五月志愿服务月活动预告",
      content: "五月是我校志愿服务月，将有多项志愿活动开展，欢迎大家积极报名参与。",
      publishDate: "2025-04-20",
      target: "volunteer",
      important: false,
      visible: true,
    },
    {
      id: "3",
      title: "关于志愿者信誉分制度的说明",
      content:
          "为了更好地管理志愿服务，我校实行志愿者信誉分制度。信誉分低于0的志愿者将被列入黑名单，一周内不能报名参加志愿活动。",
      publishDate: "2025-04-22",
      target: "volunteer",
      important: true,
      visible: true,
    },
    {
      id: "4",
      title: "负责人培训通知",
      content: "所有活动负责人需参加5月5日下午2点在行政楼302会议室举行的培训会议，请准时参加。",
      publishDate: "2025-04-25",
      target: "manager",
      important: true,
      visible: true,
    },
    {
      id: "5",
      title: "系统维护通知",
      content: "系统将于5月1日凌晨2点至4点进行维护升级，期间系统将暂停服务，请各位用户提前做好准备。",
      publishDate: "2025-04-28",
      target: "all",
      important: false,
      visible: false,
    },
    {
      id: "6",
      title: "系统维护通知",
      content: "校园志愿服务管理系统将于2025年4月28日18：00进行维护，维护时间为10小时，预计与2025年",
      publishDate: "2025-04-25",
      target: "manager",
      important: true,
      visible: true,
    },
    {
      id: "7",
      title: "暑期志愿服务招募",
      content: "暑期社区服务项目现开放报名，5月10日前登录系统选择心仪项目，志愿服务时长可兑换学分。",
      publishDate: "2025-04-30",
      target: "volunteer",
      important: true,
      visible: true,
    },
    {
      id: "8",
      title: "服务时长统计通知",
      content: "2025年第一季度志愿服务时长已统计完成，请及时查看个人中心确认，如有异议请在5月15日前反馈。",
      publishDate: "2025-04-18",
      target: "all",
      important: false,
      visible: true,
    },
    {
      id: "9",
      title: "优秀志愿者表彰",
      content: "2024年度十佳志愿者评选结果已公布，请至行政楼大厅公示栏查看，颁奖仪式将于5月20日举行。",
      publishDate: "2025-05-05",
      target: "volunteer",
      important: true,
      visible: true,
    },
    {
      id: "10",
      title: "清明节服务暂停通知",
      content: "4月4日-4月6日期间暂停所有志愿服务活动，已报名活动顺延至节后，请相互转告。",
      publishDate: "2025-03-28",
      target: "all",
      important: false,
      visible: false,
    },
    {
      id: "11",
      title: "活动安全须知",
      content: "即日起所有户外活动需签署《安全责任书》，请负责人提前在活动管理页面下载模板。",
      publishDate: "2025-05-02",
      target: "manager",
      important: true,
      visible: true,
    },
    {
      id: "12",
      title: "系统反馈收集",
      content: "为优化服务体验，现征集系统改进建议，5月参与反馈的用户将获得10信誉分奖励。",
      publishDate: "2025-04-22",
      target: "all",
      important: false,
      visible: true,
    },
    {
      id: "13",
      title: "新功能上线公告",
      content: "【活动收藏夹】功能已上线，志愿者现在可以收藏心仪活动并设置开抢提醒，详见帮助中心。",
      publishDate: "2025-05-08",
      target: "volunteer",
      important: true,
      visible: true,
    },
    {
      id: "14",
      title: "证明材料补交提醒",
      content: "以下活动负责人请注意：4月15日前组织的活动需在5月1日前补交现场照片，逾期将影响审核。",
      publishDate: "2025-04-29",
      target: "manager",
      important: true,
      visible: true,
    },
    {
      id: "15",
      title: "志愿服务证书发放",
      content: "2024年度累计服务满50小时的志愿者，请于每周三下午至大学生活动中心308室领取证书。",
      publishDate: "2025-04-12",
      target: "volunteer",
      important: false,
      visible: true,
    },
    {
      id: "16",
      title: "系统登录安全提醒",
      content: "检测到非常用设备登录提醒，请所有用户及时绑定手机验证，账户异常请联系0371-12345678。",
      publishDate: "2025-05-03",
      target: "all",
      important: true,
      visible: true,
    }
  ]
}

// 模拟添加公告
const addAnnouncement = async (announcement: any) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { ...announcement, id: Math.random().toString(36).substr(2, 9) }
}

// 模拟更新公告
const updateAnnouncement = async (id: string, announcement: any) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { ...announcement, id }
}

// 模拟删除公告
const deleteAnnouncement = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return true
}

export default function AnnouncementsPage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
  const [targetFilter, setTargetFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    publishDate: new Date().toISOString().split("T")[0],
    target: "all",
    important: false,
    visible: true,
  })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const announcementsData = await getAnnouncements()
        setAnnouncements(announcementsData)
        setFilteredAnnouncements(announcementsData)
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
    let filtered = announcements

    // 应用目标群体筛选
    if (targetFilter !== "all_targets") {
      filtered = filtered.filter((announcement) =>
          targetFilter === "all" ? true : announcement.target === targetFilter,
      )
    }

    // 应用搜索筛选
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
          (announcement) =>
              announcement.title.toLowerCase().includes(query) || announcement.content.toLowerCase().includes(query),
      )
    }

    setFilteredAnnouncements(filtered)
  }, [searchQuery, targetFilter, announcements])

  const handleOpenAddDialog = () => {
    setSelectedAnnouncement(null)
    setFormData({
      title: "",
      content: "",
      publishDate: new Date().toISOString().split("T")[0],
      target: "all",
      important: false,
      visible: true,
    })
    setFormError("")
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (announcement: any) => {
    setSelectedAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      publishDate: announcement.publishDate,
      target: announcement.target,
      important: announcement.important,
      visible: announcement.visible,
    })
    setFormError("")
    setDialogOpen(true)
  }

  const handleOpenDeleteDialog = (announcement: any) => {
    setSelectedAnnouncement(announcement)
    setDeleteDialogOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormError("")
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.title.trim()) {
      setFormError("公告标题不能为空")
      return
    }

    if (!formData.content.trim()) {
      setFormError("公告内容不能为空")
      return
    }

    try {
      if (selectedAnnouncement) {
        // 更新公告
        const updatedAnnouncement = await updateAnnouncement(selectedAnnouncement.id, formData)
        setAnnouncements(
            announcements.map((announcement) =>
                announcement.id === selectedAnnouncement.id ? updatedAnnouncement : announcement,
            ),
        )
        toast({
          title: "更新成功",
          description: "公告已成功更新",
        })
      } else {
        // 添加公告
        const newAnnouncement = await addAnnouncement(formData)
        setAnnouncements([...announcements, newAnnouncement])
        toast({
          title: "添加成功",
          description: "新公告已成功添加",
        })
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("操作失败", error)
      toast({
        title: "操作失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedAnnouncement) return

    try {
      await deleteAnnouncement(selectedAnnouncement.id)
      setAnnouncements(announcements.filter((announcement) => announcement.id !== selectedAnnouncement.id))
      toast({
        title: "删除成功",
        description: "公告已成功删除",
      })
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("删除失败", error)
      toast({
        title: "删除失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleTargetFilterChange = (value: string) => {
    setTargetFilter(value)
  }

  const getTargetBadge = (target: string) => {
    switch (target) {
      case "all":
        return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              所有用户
            </Badge>
        )
      case "volunteer":
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              志愿者
            </Badge>
        )
      case "manager":
        return (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              负责人
            </Badge>
        )
      default:
        return <Badge variant="outline">{target}</Badge>
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">公告管理</h1>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            发布公告
          </Button>
        </div>
        <p className="text-muted-foreground">管理系统公告</p>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <Input placeholder="搜索公告标题或内容..." value={searchQuery} onChange={handleSearch} className="flex-1" />
          </div>
          <div className="flex items-center space-x-2">
            <Select value={targetFilter} onValueChange={handleTargetFilterChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="筛选目标群体" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有公告</SelectItem>
                <SelectItem value="all_targets">所有目标群体</SelectItem>
                <SelectItem value="volunteer">仅志愿者</SelectItem>
                <SelectItem value="manager">仅负责人</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">网格视图</TabsTrigger>
            <TabsTrigger value="list">列表视图</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="w-full">
            {filteredAnnouncements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAnnouncements.map((announcement) => (
                      <Card
                          key={announcement.id}
                          className={`h-full flex flex-col ${!announcement.visible ? "opacity-60" : ""}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="line-clamp-1 flex items-center">
                                {!announcement.visible && <EyeOff className="h-4 w-4 mr-1 text-muted-foreground" />}
                                {announcement.title}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {announcement.publishDate}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              {announcement.important && <Badge variant="destructive">重要</Badge>}
                              {getTargetBadge(announcement.target)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2 flex-grow">
                          <p className="text-sm line-clamp-4">{announcement.content}</p>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(announcement)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleOpenDeleteDialog(announcement)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        </CardFooter>
                      </Card>
                  ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg">
                  <h3 className="text-lg font-medium">未找到匹配的公告</h3>
                  <p className="text-muted-foreground mt-1">请尝试调整筛选条件</p>
                </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="w-full">
            {filteredAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {filteredAnnouncements.map((announcement) => (
                      <Card key={announcement.id} className={!announcement.visible ? "opacity-60" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center">
                                {!announcement.visible && <EyeOff className="h-4 w-4 mr-1 text-muted-foreground" />}
                                {announcement.title}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {announcement.publishDate}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              {announcement.important && <Badge variant="destructive">重要</Badge>}
                              {getTargetBadge(announcement.target)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm">{announcement.content}</p>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(announcement)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleOpenDeleteDialog(announcement)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        </CardFooter>
                      </Card>
                  ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg">
                  <h3 className="text-lg font-medium">未找到匹配的公告</h3>
                  <p className="text-muted-foreground mt-1">请尝试调整筛选条件</p>
                </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 添加/编辑公告对话框 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedAnnouncement ? "编辑公告" : "发布公告"}</DialogTitle>
              <DialogDescription>{selectedAnnouncement ? "修改公告信息" : "创建新的系统公告"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">公告标题</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">公告内容</Label>
                <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishDate">发布日期</Label>
                <Input
                    id="publishDate"
                    name="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">目标群体</Label>
                <Select value={formData.target} onValueChange={(value) => handleSelectChange("target", value)}>
                  <SelectTrigger id="target">
                    <SelectValue placeholder="选择目标群体" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有用户</SelectItem>
                    <SelectItem value="volunteer">仅志愿者</SelectItem>
                    <SelectItem value="manager">仅负责人</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="important">标记为重要</Label>
                  <Switch
                      id="important"
                      checked={formData.important}
                      onCheckedChange={(checked) => handleSwitchChange("important", checked)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="visible">公开显示</Label>
                  <Switch
                      id="visible"
                      checked={formData.visible}
                      onCheckedChange={(checked) => handleSwitchChange("visible", checked)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit}>{selectedAnnouncement ? "保存更改" : "发布公告"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除公告确认对话框 */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>删除公告</DialogTitle>
              <DialogDescription>确认删除此公告</DialogDescription>
            </DialogHeader>
            {selectedAnnouncement && (
                <div className="py-4">
                  <p>
                    您确定要删除公告 <span className="font-bold">{selectedAnnouncement.title}</span> 吗？此操作无法撤销。
                  </p>
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
