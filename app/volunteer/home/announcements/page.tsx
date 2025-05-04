"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAnnouncements } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Info } from "lucide-react"

export default function AnnouncementsPage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const announcementsData = await getAnnouncements()
        setAnnouncements(announcementsData)
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">公告</h1>
        <Badge>{announcements.length}</Badge>
      </div>
      <p className="text-muted-foreground">查看系统公告和重要通知</p>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Info className="mr-2 h-5 w-5 text-primary" />
                    <CardTitle>{announcement.title}</CardTitle>
                  </div>
                  {announcement.important && <Badge>重要</Badge>}
                </div>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>{new Date(announcement.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{announcement.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">暂无公告</h3>
          <p className="text-muted-foreground mt-1">当前没有任何系统公告</p>
        </div>
      )}
    </div>
  )
}
