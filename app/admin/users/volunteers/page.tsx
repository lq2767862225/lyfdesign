"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers, updateUserRole, addUser, bulkImportUsers } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Award,
  Mail,
  MoreHorizontal,
  Phone,
  School,
  Search,
  User,
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  Upload,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function VolunteersManagementPage() {
  const { toast } = useToast()
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [filteredVolunteers, setFilteredVolunteers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    studentId: "",
    gender: "",
    class: "",
    department: "",
    grade: "",
    email: "",
    phone: "",
    creditScore: 3,
    serviceHours: 0,
  })
  const [importData, setImportData] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)

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

  const handleAddUser = async () => {
    try {
      // 验证必填字段
      if (!newUser.name || !newUser.studentId || !newUser.department) {
        toast({
          title: "信息不完整",
          description: "请填写必要的信息（姓名、学号和学院）",
          variant: "destructive",
        })
        return
      }

      const addedUser = await addUser({
        ...newUser,
        role: "volunteer",
      })

      // 更新列表
      setVolunteers([...volunteers, addedUser])
      setFilteredVolunteers([...filteredVolunteers, addedUser])

      // 重置表单并关闭对话框
      setNewUser({
        name: "",
        studentId: "",
        gender: "",
        class: "",
        department: "",
        grade: "",
        email: "",
        phone: "",
        creditScore: 3,
        serviceHours: 0,
      })
      setAddUserDialogOpen(false)

      toast({
        title: "添加成功",
        description: `已成功添加志愿者 ${addedUser.name}`,
      })
    } catch (error) {
      console.error("添加用户失败", error)
      toast({
        title: "添加失败",
        description: "请检查信息后重试",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = e.target.files
      if (files) {
        setImportFile(files[0])

        // 读取文件内容预览
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setImportData(event.target.result as string)
          }
        }
        reader.readAsText(files[0])
      }
    }
  }

  const handleBulkImport = async () => {
    try {
      if (!importFile && !importData) {
        toast({
          title: "数据为空",
          description: "请上传文件或输入数据",
          variant: "destructive",
        })
        return
      }

      if (importFile) {
        const result = await bulkImportUsers(importFile)

        // 更新列表
        setVolunteers([...volunteers, ...result.users])
        setFilteredVolunteers([...filteredVolunteers, ...result.users])

        // 重置并关闭对话框
        setImportData("")
        setImportFile(null)
        setBulkImportDialogOpen(false)

        toast({
          title: "批量导入成功",
          description: `已成功导入 ${result.users.length} 名志愿者`,
        })
      }
    } catch (error) {
      console.error("批量导入失败", error)
      toast({
        title: "导入失败",
        description: "请检查数据格式后重试",
        variant: "destructive",
      })
    }
  }

  // 简单的CSV解析函数
  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    return lines
        .slice(1)
        .map((line) => {
          if (!line.trim()) return null

          const values = line.split(",").map((v) => v.trim())
          const obj: Record<string, string> = {}

          headers.forEach((header, index) => {
            obj[header] = values[index] || ""
          })

          return obj
        })
        .filter(Boolean)
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="搜索志愿者姓名、学号、班级、院系或年级..."
                value={searchQuery}
                onChange={handleSearch}
                className="max-w-full"
            />
          </div>
          <div className="flex space-x-2 ml-4">
            <Button onClick={() => setAddUserDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              添加用户
            </Button>
            <Button variant="outline" onClick={() => setBulkImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              批量导入
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="mb-2">志愿者列表</CardTitle>
            <CardDescription>系统中的所有志愿者用户</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <Table className="w-full whitespace-nowrap">
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 bg-background text-center align-middle">姓名</TableHead>
                    <TableHead className="text-center align-middle">学号</TableHead>
                    <TableHead className="text-center align-middle">性别</TableHead>
                    <TableHead className="text-center align-middle">班级</TableHead>
                    <TableHead className="text-center align-middle">学院</TableHead>
                    <TableHead className="text-center align-middle">年级</TableHead>
                    <TableHead className="text-center align-middle">联系方式</TableHead>
                    <TableHead className="text-center align-middle">信誉分</TableHead>
                    <TableHead className="text-center align-middle">服务时长</TableHead>
                    <TableHead className="text-center align-middle">状态</TableHead>
                    <TableHead className="text-center align-middle">操作</TableHead>
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
                            <TableCell className="text-center">{volunteer.studentId}</TableCell>
                            <TableCell className="text-center">{volunteer.gender}</TableCell>
                            <TableCell className="text-center">{volunteer.class}</TableCell>
                            <TableCell className="text-center">{volunteer.department}</TableCell>
                            <TableCell className="text-center">{volunteer.grade}</TableCell>
                            <TableCell className="text-center">{volunteer.phone}</TableCell>
                            <TableCell className="text-center">{volunteer.creditScore}</TableCell>
                            <TableCell className="text-center">{volunteer.serviceHours}小时</TableCell>
                            <TableCell className="text-center">
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
                                  <DropdownMenuItem className="text-red-600" onClick={() => {}}>
                                    重置密码
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      // TODO(dev) 修改空数值时的状态
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

        {/* 添加用户对话框 */}
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>添加志愿者</DialogTitle>
              <DialogDescription>添加新的志愿者用户到系统</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                      id="name"
                      name="name"
                      placeholder="请输入姓名"
                      value={newUser.name}
                      onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="studentId">学号 *</Label>
                  <Input
                      id="studentId"
                      name="studentId"
                      placeholder="请输入学号"
                      value={newUser.studentId}
                      onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gender">性别</Label>
                  <Select value={newUser.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">学院 *</Label>
                  <Input
                      id="department"
                      name="department"
                      placeholder="请输入学院"
                      value={newUser.department}
                      onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="class">班级</Label>
                  <Input
                      id="class"
                      name="class"
                      placeholder="请输入班级"
                      value={newUser.class}
                      onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade">年级</Label>
                  <Select value={newUser.grade} onValueChange={(value) => handleSelectChange("grade", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="大一">大一</SelectItem>
                      <SelectItem value="大二">大二</SelectItem>
                      <SelectItem value="大三">大三</SelectItem>
                      <SelectItem value="大四">大四</SelectItem>
                      <SelectItem value="研一">研一</SelectItem>
                      <SelectItem value="研二">研二</SelectItem>
                      <SelectItem value="研三">研三</SelectItem>
                      <SelectItem value="博士">博士</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">电话</Label>
                  <Input
                      id="phone"
                      name="phone"
                      placeholder="请输入电话"
                      value={newUser.phone}
                      onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creditScore">初始信誉分</Label>
                  <Input
                      id="creditScore"
                      name="creditScore"
                      type="number"
                      placeholder="3"
                      value={newUser.creditScore}
                      onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="serviceHours">初始服务时长</Label>
                  <Input
                      id="serviceHours"
                      name="serviceHours"
                      type="number"
                      placeholder="0"
                      value={newUser.serviceHours}
                      onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddUser}>添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 批量导入对话框 */}
        <Dialog open={bulkImportDialogOpen} onOpenChange={setBulkImportDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>批量导入志愿者</DialogTitle>
              <DialogDescription>通过CSV或JSON文件批量导入志愿者数据</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="importFile">上传文件</Label>
                <Input id="importFile" type="file" accept=".csv,.json" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">支持CSV或JSON格式。CSV文件第一行必须包含字段名称。</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkImportDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleBulkImport}>导入</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
