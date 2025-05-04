"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, CalendarFold } from "lucide-react"
import { getAnnouncements } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SystemMessagesPage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  // 模拟系统通知数据
  const mockNotifications = [
    {
      id: "notif1",
      title: "活动报名成功",
      content: "您已成功报名参加“校园环保行动”活动",
      createdAt: "2025-04-25T10:30:00",
      read: true,
    },
    {
      id: "notif2",
      title: "活动即将开始",
      content: "您报名的“敬老院志愿服务”活动将于明天下午2点开始，请准时参加",
      createdAt: "2025-05-04T09:15:00",
      read: false,
    },
    {
      id: "notif3",
      title: "服务时长已认证",
      content: "您参与的“图书馆整理志愿活动”的服务时长4小时已认证",
      createdAt: "2025-04-28T18:20:00",
      read: false,
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const announcementsData = await getAnnouncements()
        setAnnouncements(announcementsData)

        // 设置模拟通知数据
        setNotifications(mockNotifications)
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

    // 设置 SSE 连接
    setupSSE()

    return () => {
      // 清理 SSE 连接
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [toast])

  const setupSSE = () => {
    // 在实际应用中，这里应该连接到真实的 SSE 端点
    // 这里我们模拟 SSE 行为

    // 模拟 SSE 连接
    console.log("设置 SSE 连接...")

    // 在实际应用中，这里应该是真实的 SSE URL
    // const source = new EventSource('/api/notifications/sse');

    // 模拟定时发送新通知
    const intervalId = setInterval(() => {
      const newNotification = {
        id: `notif-${Date.now()}`,
        title: "新的系统通知",
        content: `这是一条实时推送的系统通知 - ${new Date().toLocaleTimeString()}`,
        createdAt: new Date().toISOString(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])

      toast({
        title: "收到新通知",
        description: newNotification.title,
      })
    }, 60000) // 每分钟发送一条新通知

    // 清理函数
    return () => clearInterval(intervalId)
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
    toast({
      title: "已全部标记为已读",
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">系统消息</h1>
        <div className="flex items-center">
          <Badge className="mr-2">{unreadCount} 未读</Badge>
          <button className="text-sm text-primary hover:underline" onClick={markAllAsRead}>
            全部标为已读
          </button>
        </div>
      </div>
      <p className="text-muted-foreground">查看系统通知和公告</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                <CardTitle>通知中心</CardTitle>
              </div>
              <CardDescription>实时接收系统通知</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${!notification.read ? "bg-blue-50 border-blue-200" : ""}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center">
                            {!notification.read && <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>}
                            {notification.title}
                          </h3>
                          <p className="text-sm mt-1">{notification.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">暂无系统通知</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <CalendarFold className="mr-2 h-5 w-5" />
                <CardTitle>公告</CardTitle>
              </div>
              <CardDescription>最新系统公告</CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{announcement.title}</h3>
                        {announcement.important && <Badge variant="destructive">重要</Badge>}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">暂无公告</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
