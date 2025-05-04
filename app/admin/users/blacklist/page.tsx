"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers, updateUserCredit } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Mail, MoreHorizontal, Phone, School, Search, Shield, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BlacklistPage() {
  const { toast } = useToast()
  const [blacklistedUsers, setBlacklistedUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers("all")
        // 筛选出信誉分低于等于0的用户
        const blacklisted = usersData.filter((user: any) => user.creditScore <= 0)
        setBlacklistedUsers(blacklisted)
        setFilteredUsers(blacklisted)
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
      setFilteredUsers(blacklistedUsers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = blacklistedUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.department.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, blacklistedUsers])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleViewDetails = (user: any) => {
    setSelectedUser(user)
    setDetailsDialogOpen(true)
  }

  const handleOpenRemoveDialog = (user: any) => {
    setSelectedUser(user)
    setRemoveDialogOpen(true)
  }

  const handleRemoveFromBlacklist = async () => {
    if (!selectedUser) return

    setProcessing(true)

    try {
      // 将用户信誉分调整为正数，移出黑名单
      await updateUserCredit(selectedUser.id, 10)

      // 更新列表
      const updatedUser = { ...selectedUser, creditScore: 10 }
      setBlacklistedUsers(blacklistedUsers.filter((user) => user.id !== selectedUser.id))

      toast({
        title: "操作成功",
        description: "用户已从黑名单中移除",
      })
      setRemoveDialogOpen(false)
    } catch (error) {
      console.error("操作失败", error)
      toast({
        title: "操作失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">黑名单管理</h1>
        <Badge variant="destructive">{blacklistedUsers.length}</Badge>
      </div>
      <p className="text-muted-foreground">管理信誉分过低的用户</p>

      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>黑名单中的用户无法报名参加志愿活动，直到其信誉分恢复为正数。</AlertDescription>
      </Alert>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索用户姓名、院系或邮箱..."
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>黑名单用户</CardTitle>
          <CardDescription>信誉分低于或等于0的用户</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>院系</TableHead>
                <TableHead>信誉分</TableHead>
                <TableHead>加入黑名单原因</TableHead>
                <TableHead>黑名单时长</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{user.creditScore}</Badge>
                    </TableCell>
                    <TableCell>{user.blacklistReason || "未参加已报名活动"}</TableCell>
                    <TableCell>{user.blacklistDays || "7"}天</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作菜单</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>查看详情</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenRemoveDialog(user)}>移出黑名单</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    未找到匹配的黑名单用户
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 用户详情对话框 */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>查看黑名单用户的详细信息</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-2">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.department}</p>
                <Badge variant="destructive" className="mt-2">
                  信誉分: {selectedUser.creditScore}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">邮箱</span>
                  </div>
                  <span className="text-sm font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">电话</span>
                  </div>
                  <span className="text-sm font-medium">{selectedUser.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <School className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">院系</span>
                  </div>
                  <span className="text-sm font-medium">{selectedUser.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">角色</span>
                  </div>
                  <span className="text-sm font-medium">{selectedUser.role === "volunteer" ? "志愿者" : "负责人"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">黑名单原因</span>
                  </div>
                  <span className="text-sm font-medium">{selectedUser.blacklistReason || "未参加已报名活动"}</span>
                </div>
              </div>

              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>该用户将在信誉分恢复为正数后自动移出黑名单。</AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              关闭
            </Button>
            <Button
              onClick={() => {
                setDetailsDialogOpen(false)
                handleOpenRemoveDialog(selectedUser)
              }}
            >
              移出黑名单
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 移出黑名单确认对话框 */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>移出黑名单</DialogTitle>
            <DialogDescription>确认将此用户从黑名单中移除</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p>
                您确定要将用户 <span className="font-bold">{selectedUser.name}</span>{" "}
                从黑名单中移除吗？此操作将恢复用户的信誉分至10分，允许其再次参与志愿活动。
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleRemoveFromBlacklist} disabled={processing}>
              {processing ? "处理中..." : "确认移除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
