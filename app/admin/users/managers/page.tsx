"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers, getActivities } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardList, Mail, MoreHorizontal, Phone, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ManagersManagementPage() {
  const { toast } = useToast()
  const [managers, setManagers] = useState<any[]>([])
  const [filteredManagers, setFilteredManagers] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedManager, setSelectedManager] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activitiesDialogOpen, setActivitiesDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [managersData, activitiesData] = await Promise.all([getUsers("manager"), getActivities()])
        setManagers(managersData)
        setFilteredManagers(managersData)
        setActivities(activitiesData)
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
      setFilteredManagers(managers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = managers.filter(
        (manager) =>
          manager.name.toLowerCase().includes(query) ||
          manager.department.toLowerCase().includes(query) ||
          manager.email.toLowerCase().includes(query),
      )
      setFilteredManagers(filtered)
    }
  }, [searchQuery, managers])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleViewDetails = (manager: any) => {
    setSelectedManager(manager)
    setDialogOpen(true)
  }

  const handleViewActivities = (manager: any) => {
    setSelectedManager(manager)
    setActivitiesDialogOpen(true)
  }

  const getManagerActivities = (managerId: string) => {
    return activities.filter((activity) => activity.managerId === managerId)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">负责人管理</h1>
        <Badge>{managers.length}</Badge>
      </div>
      <p className="text-muted-foreground">管理系统中的活动负责人</p>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索负责人姓名、院系或邮箱..."
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-full"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>负责人列表</CardTitle>
          <CardDescription>系统中的所有活动负责人</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>院系</TableHead>
                <TableHead>负责活动数</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManagers.length > 0 ? (
                filteredManagers.map((manager) => {
                  const managerActivities = getManagerActivities(manager.id)
                  return (
                    <TableRow key={manager.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={manager.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{manager.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{manager.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{managerActivities.length}</Badge>
                      </TableCell>
                      <TableCell>{manager.phone}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">操作菜单</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(manager)}>查看详情</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewActivities(manager)}>
                              查看负责活动
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    未找到匹配的负责人
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 负责人详情对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>负责人详情</DialogTitle>
            <DialogDescription>查看负责人的详细信息</DialogDescription>
          </DialogHeader>
          {selectedManager && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-2">
                  <AvatarImage src={selectedManager.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedManager.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold">{selectedManager.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedManager.department}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">邮箱</span>
                  </div>
                  <span className="text-sm font-medium">{selectedManager.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">电话</span>
                  </div>
                  <span className="text-sm font-medium">{selectedManager.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">负责活动数</span>
                  </div>
                  <span className="text-sm font-medium">{getManagerActivities(selectedManager.id).length}</span>
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

      {/* 负责活动对话框 */}
      <Dialog open={activitiesDialogOpen} onOpenChange={setActivitiesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>负责活动列表</DialogTitle>
            <DialogDescription>
              {selectedManager ? `${selectedManager.name} 负责的活动列表` : "活动列表"}
            </DialogDescription>
          </DialogHeader>
          {selectedManager && (
            <div className="max-h-[60vh] overflow-auto">
              {getManagerActivities(selectedManager.id).length > 0 ? (
                <div className="space-y-2">
                  {getManagerActivities(selectedManager.id).map((activity) => (
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
                                ? "已拒��"
                                : activity.status === "completed"
                                  ? "已完成"
                                  : "已取消"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>时间: {new Date(activity.startTime).toLocaleDateString()}</p>
                        <p>地点: {activity.location}</p>
                        <p>
                          参与人数: {activity.participants.length}/{activity.maxParticipants}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">该负责人暂无负责的活动</div>
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
