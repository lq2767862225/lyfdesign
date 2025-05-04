"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers, updateUserRole } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, Mail, MoreHorizontal, Phone, School, Search, User, Users, GraduationCap, BookOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function VolunteersManagementPage() {
  const { toast } = useToast()
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [filteredVolunteers, setFilteredVolunteers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers("volunteer")
        setVolunteers(usersData)
        setFilteredVolunteers(usersData)
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
          volunteer.email.toLowerCase().includes(query) ||
          volunteer.studentId?.toLowerCase().includes(query) ||
          volunteer.class?.toLowerCase().includes(query) ||
          volunteer.grade?.toLowerCase().includes(query),
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

  const handlePromoteToManager = async (volunteerId: string) => {
    try {
      await updateUserRole(volunteerId, "manager")
      toast({
        title: "操作成功",
        description: "已将志愿者提升为负责人",
      })
      // 更新列表
      setVolunteers(volunteers.filter((v) => v.id !== volunteerId))
      setFilteredVolunteers(filteredVolunteers.filter((v) => v.id !== volunteerId))
      setRoleDialogOpen(false)
    } catch (error) {
      console.error("操作失败", error)
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
        <h1 className="text-3xl font-bold tracking-tight">志愿者管理</h1>
        <Badge>{volunteers.length}</Badge>
      </div>
      <p className="text-muted-foreground">管理系统中的志愿者用户</p>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索志愿者姓名、学号、班级、院系或年级..."
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-full"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>志愿者列表</CardTitle>
          <CardDescription>系统中的所有志愿者用户</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table className="w-full whitespace-nowrap">
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="sticky text-center left-0 z-20 bg-background">姓名</TableHead>
                  <TableHead className="text-center">学号</TableHead>
                  <TableHead className="text-center">性别</TableHead>
                  <TableHead className="text-center">班级</TableHead>
                  <TableHead className="text-center">学院</TableHead>
                  <TableHead className="text-center">年级</TableHead>
                  <TableHead className="text-center">联系方式</TableHead>
                  <TableHead className="text-center">信誉分</TableHead>
                  <TableHead className="text-center">服务时长</TableHead>
                  <TableHead className="text-center">状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVolunteers.length > 0 ? (
                  filteredVolunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell className="sticky left-0 z-20 bg-background">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={volunteer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{volunteer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{volunteer.studentId}</TableCell>
                      <TableCell>{volunteer.gender}</TableCell>
                      <TableCell>{volunteer.class}</TableCell>
                      <TableCell>{volunteer.department}</TableCell>
                      <TableCell>{volunteer.grade}</TableCell>
                      <TableCell>{volunteer.phone}</TableCell>
                      <TableCell>{volunteer.creditScore}</TableCell>
                      <TableCell>{volunteer.serviceHours}小时</TableCell>
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
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedVolunteer(volunteer)
                                setRoleDialogOpen(true)
                              }}
                            >
                              提升为负责人
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                      未找到匹配的志愿者
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">学号</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.studentId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">性别</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.gender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">班级</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.class}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <School className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">学院</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">年级</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.grade}</span>
                </div>
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
                    <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">信誉分</span>
                  </div>
                  <span className="text-sm font-medium">{selectedVolunteer.creditScore}</span>
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

      {/* 提升为负责人对话框 */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>提升为负责人</DialogTitle>
            <DialogDescription>确认将此志愿者提升为活动负责人</DialogDescription>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="py-4">
              <p>
                您确定要将志愿者 <span className="font-bold">{selectedVolunteer.name}</span>{" "}
                提升为活动负责人吗？此操作将授予该用户活动管理权限。
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => selectedVolunteer && handlePromoteToManager(selectedVolunteer.id)}>确认提升</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
