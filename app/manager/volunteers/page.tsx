"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers, getActivities, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, Clock, Mail, MessageSquare, MoreHorizontal, Phone, School, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ManagerVolunteersPage() {
  const { toast } = useToast()
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [filteredVolunteers, setFilteredVolunteers] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activitiesDialogOpen, setActivitiesDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volunteersData, activitiesData, userData] = await Promise.all([
          getUsers("volunteer"),
          getActivities(),
          getCurrentUser(),
        ])
        setCurrentUser(userData)

        // 筛选出参与当前负责人活动的志愿者
        const managerActivities = activitiesData.filter((activity) => activity.managerId === userData.id)
        const participantIds = new Set()
        managerActivities.forEach((activity) => {
          activity.participants.forEach((id: string) => participantIds.add(id))
        })

        const relevantVolunteers = volunteersData.filter((volunteer) => participantIds.has(volunteer.id))

        setVolunteers(relevantVolunteers)
        setFilteredVolunteers(relevantVolunteers)
        setActivities(managerActivities)
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
    if (searchQuery.trim() === "") {
      setFilteredVolunteers(volunteers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = volunteers.filter(
        (volunteer) =>
          volunteer.name.toLowerCase().includes(query) ||
          volunteer.department.toLowerCase().includes(query) ||
          volunteer.email.toLowerCase().includes(query),
      )
      setFilteredVolunteers(filtered)
    }
  }, [searchQuery, volunteers])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleViewDetails = (volunteer: any) => {
    setSelectedVolunteer(volunteer)
    setDialogOpen(true)
  }

  const handleViewActivities = (volunteer: any) => {
    setSelectedVolunteer(volunteer)
    setActivitiesDialogOpen(true)
  }

  const getVolunteerActivities = (volunteerId: string) => {
    return activities.filter((activity) => activity.participants.includes(volunteerId))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">志愿者管理</h1>
        <Badge>{volunteers.length}</Badge>
      </div>
      <p className="text-muted-foreground">管理参与您活动的志愿者</p>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索志愿者姓名、院系或邮箱..."
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>志愿者列表</CardTitle>
          <CardDescription>参与您活动的志愿者</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>院系</TableHead>
                <TableHead>参与活动数</TableHead>
                <TableHead>信誉分</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map((volunteer) => {
                  const volunteerActivities = getVolunteerActivities(volunteer.id)
                  return (
                    <TableRow key={volunteer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={volunteer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{volunteer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{volunteer.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{volunteerActivities.length}</Badge>
                      </TableCell>
                      <TableCell>{volunteer.creditScore}</TableCell>
                      <TableCell>
                        {volunteer.creditScore <= 0 ? (
                          <Badge variant="destructive">黑名单</Badge>
                        ) : volunteer.creditScore >= 80 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            优秀
                          </Badge>
                        ) : (
                          <Badge variant="outline">正常</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">操作菜单</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(volunteer)}>查看详情</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewActivities(volunteer)}>
                              查看参与活动
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              发送消息
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    未找到匹配的志愿者
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 志愿者详情对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>志愿者详情</DialogTitle>
            <DialogDescription>查看志愿者的详细信息</DialogDescription>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-2">
                  <AvatarImage src={selectedVolunteer.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedVolunteer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold">{selectedVolunteer.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedVolunteer.department}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">邮箱</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">电话</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <School className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">院系</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">信誉分</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.creditScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">服务时长</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.serviceHours}小时</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 参与活动对话框 */}
      <Dialog open={activitiesDialogOpen} onOpenChange={setActivitiesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>参与活动列表</DialogTitle>
            <DialogDescription>
              {selectedVolunteer ? `${selectedVolunteer.name} 参与的活动列表` : "活动列表"}
            </DialogDescription>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="max-h-[60vh] overflow-auto">
              {getVolunteerActivities(selectedVolunteer.id).length > 0 ? (
                <div className="space-y-2">
                  {getVolunteerActivities(selectedVolunteer.id).map((activity) => (
                    <div key={activity.id} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{activity.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{activity.type}类活动</p>
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
                      <div className="mt-2 text-sm">
                        <p>时间: {new Date(activity.startTime).toLocaleDateString()}</p>
                        <p>地点: {activity.location}</p>
                        <p>服务时长: {activity.serviceHours}小时</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">该志愿者暂无参与您负责的活动</div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivitiesDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
