"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, updateUserProfile } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Award, Clock, Mail, Phone, School, User, Users } from "lucide-react"

export default function ProfileInfoPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        // 初始化表单数据
        if (userData) {
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            department: userData.department || "",
          })
        }
      } catch (error) {
        console.error("获取用户数据失败", error)
        toast({
          title: "获取用户数据失败",
          description: "请稍后再试",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (user) {
        const updatedUser = await updateUserProfile(user.id, formData)
        setUser(updatedUser)
        toast({
          title: "保存成功",
          description: "个人资料已更新",
        })
      }
    } catch (error) {
      console.error("更新用户资料失败", error)
      toast({
        title: "保存失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center h-64">未找到用户数据</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">个人档案</h1>
      <p className="text-muted-foreground">查看和管理您的个人信息</p>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">基本资料</TabsTrigger>
          <TabsTrigger value="stats">志愿统计</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>您的基本个人信息</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.department}</p>
                <div className="flex items-center mt-2">
                  <Badge className="mr-2">志愿者</Badge>
                  {user.creditScore > 80 && <Badge variant="outline">优秀志愿者</Badge>}
                </div>

                <div className="w-full mt-6 space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>用户名: {user.username}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>邮箱: {user.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>电话: {user.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <School className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>院系: {user.department}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>编辑资料</CardTitle>
                  <CardDescription>更新您的个人信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">电话</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">院系</Label>
                    <Input id="department" name="department" value={formData.department} onChange={handleChange} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saving}>
                    {saving ? "保存中..." : "保存更改"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-primary" />
                  <CardTitle>志愿服务统计</CardTitle>
                </div>
                <CardDescription>您的志愿服务数据概览</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">累计服务时长</p>
                        <p className="text-sm text-muted-foreground">总志愿服务小时数</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{user.serviceHours || 0}小时</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Award className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">信誉分</p>
                        <p className="text-sm text-muted-foreground">反映志愿活动参与信用</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{user.creditScore || 0}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">参与活动数</p>
                        <p className="text-sm text-muted-foreground">已参与的志愿活动数量</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">2</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>服务时长趋势</CardTitle>
                <CardDescription>近期志愿服务时长变化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between">
                  {["1月", "2月", "3月", "4月", "5月"].map((month, index) => {
                    // 模拟数据
                    const hours = [4, 6, 8, 6, 0][index]
                    const maxHeight = 180
                    const height = hours ? (hours / 8) * maxHeight : 20

                    return (
                      <div key={month} className="flex flex-col items-center">
                        <div
                          className="w-12 bg-primary/20 rounded-t-md"
                          style={{
                            height: `${height}px`,
                            minHeight: "20px",
                          }}
                        >
                          <div
                            className="w-full bg-primary rounded-t-md"
                            style={{
                              height: `${hours ? 100 : 0}%`,
                              minHeight: hours ? "10px" : "0",
                            }}
                          />
                        </div>
                        <div className="mt-2 text-xs font-medium">{month}</div>
                        <div className="text-xs text-muted-foreground">{hours}h</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
