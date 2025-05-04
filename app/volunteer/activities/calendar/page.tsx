"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Clock, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// 模拟活动数据
const activities = [
  {
    id: "act1",
    title: "校园环保行动",
    date: new Date("2025-05-01"),
    startTime: "09:00",
    endTime: "12:00",
    location: "校园主广场",
    type: "已报名活动",
    conflict: true,
    participants: 15,
    maxParticipants: 30,
    serviceHours: 3,
    conflictWith: "高等数学",
  },
  {
    id: "act2",
    title: "敬老院志愿服务",
    date: new Date("2025-05-05"),
    startTime: "14:00",
    endTime: "17:00",
    location: "市第一敬老院",
    type: "已报名活动",
    conflict: false,
    participants: 8,
    maxParticipants: 20,
    serviceHours: 3,
  },
  {
    id: "act3",
    title: "社区图书馆整理",
    date: new Date("2025-05-10"),
    startTime: "13:00",
    endTime: "16:00",
    location: "社区图书馆",
    type: "可报名活动",
    conflict: false,
    participants: 5,
    maxParticipants: 10,
    serviceHours: 3,
  },
  {
    id: "act4",
    title: "公园清洁日",
    date: new Date("2025-05-15"),
    startTime: "08:00",
    endTime: "11:00",
    location: "市中心公园",
    type: "可报名活动",
    conflict: true,
    participants: 12,
    maxParticipants: 25,
    serviceHours: 3,
    conflictWith: "程序设计",
  },
  {
    id: "class1",
    title: "高等数学",
    date: new Date("2025-05-01"),
    startTime: "10:00",
    endTime: "11:30",
    location: "教学楼A-301",
    type: "课程",
    conflict: true,
    conflictWith: "校园环保行动",
  },
  {
    id: "class2",
    title: "大学英语",
    date: new Date("2025-05-05"),
    startTime: "08:00",
    endTime: "09:30",
    location: "教学楼B-201",
    type: "课程",
    conflict: false,
  },
  {
    id: "class3",
    title: "数据结构",
    date: new Date("2025-05-03"),
    startTime: "14:00",
    endTime: "15:30",
    location: "教学楼C-401",
    type: "课程",
    conflict: false,
  },
  {
    id: "class4",
    title: "计算机网络",
    date: new Date("2025-05-07"),
    startTime: "10:00",
    endTime: "11:30",
    location: "教学楼A-501",
    type: "课程",
    conflict: false,
  },
  {
    id: "class5",
    title: "程序设计",
    date: new Date("2025-05-15"),
    startTime: "09:00",
    endTime: "10:30",
    location: "教学楼B-301",
    type: "课程",
    conflict: true,
    conflictWith: "公园清洁日",
  },
  // 添加更多冲突示例 - 同一天多个冲突
  {
    id: "act5",
    title: "校园宣讲活动",
    date: new Date("2025-05-20"),
    startTime: "13:00",
    endTime: "15:00",
    location: "学生活动中心",
    type: "已报名活动",
    conflict: true,
    participants: 10,
    maxParticipants: 20,
    serviceHours: 2,
    conflictWith: "软件工程",
  },
  {
    id: "class6",
    title: "软件工程",
    date: new Date("2025-05-20"),
    startTime: "14:00",
    endTime: "15:30",
    location: "教学楼D-401",
    type: "课程",
    conflict: true,
    conflictWith: "校园宣讲活动",
  },
  {
    id: "act6",
    title: "社区疫情防控",
    date: new Date("2025-05-20"),
    startTime: "16:00",
    endTime: "18:00",
    location: "阳光社区",
    type: "可报名活动",
    conflict: false,
    participants: 8,
    maxParticipants: 15,
    serviceHours: 2,
  },
]

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: typeof activities
}

export default function ActivityCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2025-05-20"))
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2025-05-20"))
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  // 根据选择的日期过滤活动
  const filteredActivities = activities.filter(
    (activity) =>
      activity.date.getDate() === selectedDate.getDate() &&
      activity.date.getMonth() === selectedDate.getMonth() &&
      activity.date.getFullYear() === selectedDate.getFullYear(),
  )

  // 检查是否有冲突的活动
  const hasConflict = filteredActivities.some((activity) => activity.conflict)

  // 生成日历数据
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()

      // 获取当月第一天
      const firstDayOfMonth = new Date(year, month, 1)
      // 获取当月最后一天
      const lastDayOfMonth = new Date(year, month + 1, 0)

      // 获取当月第一天是星期几（0-6，0是星期日）
      const firstDayOfWeek = firstDayOfMonth.getDay()

      // 计算日历开始日期（可能是上个月的日期）
      const calendarStart = new Date(firstDayOfMonth)
      calendarStart.setDate(calendarStart.getDate() - firstDayOfWeek)

      const days: CalendarDay[] = []
      const today = new Date()

      // 生成6周的日历（42天）
      for (let i = 0; i < 42; i++) {
        const currentDay = new Date(calendarStart)
        currentDay.setDate(calendarStart.getDate() + i)

        const isCurrentMonth = currentDay.getMonth() === month
        const isToday =
          currentDay.getDate() === today.getDate() &&
          currentDay.getMonth() === today.getMonth() &&
          currentDay.getFullYear() === today.getFullYear()

        // 获取当天的活动
        const dayEvents = activities.filter(
          (activity) =>
            activity.date.getDate() === currentDay.getDate() &&
            activity.date.getMonth() === currentDay.getMonth() &&
            activity.date.getFullYear() === currentDay.getFullYear(),
        )

        days.push({
          date: new Date(currentDay),
          isCurrentMonth,
          isToday,
          events: dayEvents,
        })
      }

      setCalendarDays(days)
    }

    generateCalendarDays()
  }, [currentDate])

  // 切换到上个月
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  // 切换到下个月
  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  // 切换到今天
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // 获取月份名称
  const getMonthName = (date: Date) => {
    return date.toLocaleString("zh-CN", { month: "long" })
  }

  // 获取年份
  const getYear = (date: Date) => {
    return date.getFullYear()
  }

  // 获取星期几的名称
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">活动日历</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>
                {getYear(currentDate)}年{getMonthName(currentDate)}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  上个月
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  今天
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  下个月
                </Button>
              </div>
            </div>
            {/*<CardDescription>点击日期查看详细活动</CardDescription>*/}
          </CardHeader>
          <CardContent>
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center py-2 font-medium text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历格子 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const hasEvents = day.events.length > 0
                const hasConflict = day.events.some((event) => event.conflict)

                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "h-20 p-1 w-full rounded-md flex flex-col items-start justify-start border transition-colors",
                            day.isToday ? "bg-primary/10 border-primary" : "hover:bg-muted/50",
                            !day.isCurrentMonth && "text-muted-foreground bg-muted/30",
                            selectedDate &&
                              selectedDate.getDate() === day.date.getDate() &&
                              selectedDate.getMonth() === day.date.getMonth() &&
                              selectedDate.getFullYear() === day.date.getFullYear()
                              ? "ring-2 ring-primary"
                              : "",
                          )}
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <span className={cn("text-sm font-medium", day.isToday ? "text-primary" : "")}>
                            {day.date.getDate()}
                          </span>

                          {/* 活动指示器 */}
                          <div className="mt-auto w-full flex flex-wrap gap-1">
                            {hasEvents && (
                              <div className="flex gap-1 flex-wrap">
                                {day.events.some((e) => e.type === "已报名活动") && (
                                  <div
                                    className={cn(
                                      "w-2 h-2 rounded-full bg-green-500",
                                      hasConflict ? "animate-pulse" : "",
                                    )}
                                  />
                                )}
                                {day.events.some((e) => e.type === "可报名活动") && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                )}
                                {day.events.some((e) => e.type === "课程") && (
                                  <div
                                    className={cn(
                                      "w-2 h-2 rounded-full bg-orange-500",
                                      hasConflict ? "animate-pulse" : "",
                                    )}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        {hasEvents ? (
                          <div className="space-y-1 text-xs">
                            {day.events.map((event, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    event.type === "已报名活动"
                                      ? "bg-green-500"
                                      : event.type === "可报名活动"
                                        ? "bg-blue-500"
                                        : "bg-orange-500",
                                  )}
                                />
                                <span>
                                  {event.title} ({event.startTime}-{event.endTime})
                                </span>
                                {event.conflict && (
                                  <div className="flex items-center">
                                    <AlertTriangle className="h-3 w-3 text-destructive" />
                                    <span className="text-destructive ml-1">与{event.conflictWith}冲突</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>无活动安排</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-start space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                <span>已报名活动</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                <span>可报名活动</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-1" />
                <span>课程</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
            </CardTitle>
            <CardDescription>当日活动和课程安排</CardDescription>
          </CardHeader>
          <CardContent>
            {hasConflict && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>时间冲突提醒</AlertTitle>
                <AlertDescription>
                  <p>您当天的部分活动与课程时间存在冲突，请注意调整</p>
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {filteredActivities
                      .filter((activity) => activity.conflict)
                      .map((activity) => (
                        <li key={activity.id}>
                          <span className="font-medium">{activity.title}</span> ({activity.startTime}-{activity.endTime}
                          ) 与 <span className="font-medium">{activity.conflictWith}</span> 时间冲突
                        </li>
                      ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border ${
                      activity.conflict
                        ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50"
                        : activity.type === "已报名活动"
                          ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50"
                          : activity.type === "可报名活动"
                            ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50"
                            : "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          activity.type === "已报名活动"
                            ? "default"
                            : activity.type === "可报名活动"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>
                        {activity.startTime} - {activity.endTime}
                      </span>
                      {activity.conflict && (
                        <Badge variant="destructive" className="ml-2">
                          时间冲突
                        </Badge>
                      )}
                    </div>

                    {(activity.type === "已报名活动" || activity.type === "可报名活动") && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Users className="mr-1 h-4 w-4" />
                          <span>
                            {activity.participants}/{activity.maxParticipants} 人
                          </span>
                        </div>
                        {activity.serviceHours && (
                          <Badge variant="outline" className="ml-2">
                            {activity.serviceHours} 服务时长
                          </Badge>
                        )}
                      </div>
                    )}

                    {activity.conflict && activity.conflictWith && (
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm border border-red-200 dark:border-red-800">
                        <span className="font-medium text-red-700 dark:text-red-400">冲突详情：</span> 与
                        <span className="font-semibold"> {activity.conflictWith} </span>
                        时间重叠
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">当天没有活动或课程安排</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
