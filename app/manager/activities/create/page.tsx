"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createActivity } from "@/lib/api"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock, MapPin, Users } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

export default function CreateActivityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
    date: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    registrationDeadline: undefined as Date | undefined,
    minParticipants: "",
    maxParticipants: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 格式化数据
      const activityData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        startTime: formData.date ? `${format(formData.date, "yyyy-MM-dd")}T${formData.startTime}:00` : "",
        endTime: formData.date ? `${format(formData.date, "yyyy-MM-dd")}T${formData.endTime}:00` : "",
        registrationDeadline: formData.registrationDeadline
          ? `${format(formData.registrationDeadline, "yyyy-MM-dd")}T18:00:00`
          : "",
        minParticipants: Number.parseInt(formData.minParticipants),
        maxParticipants: Number.parseInt(formData.maxParticipants),
        managerId: "manager1", // 假设当前登录的负责人ID
        status: "pending",
      }

      await createActivity(activityData)
      router.push("/manager/activities/my-activities")
    } catch (error) {
      console.error("创建活动失败", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">申报新活动</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>活动信息</CardTitle>
            <CardDescription>请填写活动的详细信息，提交后等待管理员审批</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">活动名称</Label>
              <Input
                id="title"
                name="title"
                placeholder="请输入活动名称"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">活动描述</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="请详细描述活动内容、目的和要求"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">活动地点</Label>
                <div className="flex">
                  <MapPin className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="请输入活动地点"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">活动类型</Label>
                <Select onValueChange={(value) => handleSelectChange("type", value)} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="选择活动类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="环保">环保</SelectItem>
                    <SelectItem value="关爱">关爱</SelectItem>
                    <SelectItem value="教育">教育</SelectItem>
                    <SelectItem value="科技">科技</SelectItem>
                    <SelectItem value="健康">健康</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>活动日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, "yyyy年MM月dd日", { locale: zhCN })
                    ) : (
                      <span>选择活动日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleDateChange("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">开始时间</Label>
                <div className="flex">
                  <Clock className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">结束时间</Label>
                <div className="flex">
                  <Clock className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>报名截止日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.registrationDeadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.registrationDeadline ? (
                      format(formData.registrationDeadline, "yyyy年MM月dd日", { locale: zhCN })
                    ) : (
                      <span>选择报名截止日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.registrationDeadline}
                    onSelect={(date) => handleDateChange("registrationDeadline", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minParticipants">最少参与人数</Label>
                <div className="flex">
                  <Users className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="minParticipants"
                    name="minParticipants"
                    type="number"
                    min="1"
                    placeholder="最少需要的志愿者数量"
                    value={formData.minParticipants}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">最多参与人数</Label>
                <div className="flex">
                  <Users className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    placeholder="最多可接收的志愿者数量"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "提交中..." : "提交申请"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
