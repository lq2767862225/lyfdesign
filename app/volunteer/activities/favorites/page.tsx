"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Heart, MapPin, Users } from "lucide-react"
import { getActivities, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function FavoritesPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 模拟收藏的活动ID
  const favoriteActivityIds = ["act1", "act3"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        const activitiesData = await getActivities()
        // 筛选出收藏的活动
        const favoriteActivities = activitiesData.filter((activity: any) => favoriteActivityIds.includes(activity.id))
        setActivities(favoriteActivities)
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

  const handleRemoveFavorite = (activityId: string) => {
    // 模拟从收藏中移除
    setActivities(activities.filter((activity) => activity.id !== activityId))
    toast({
      title: "已移除收藏",
      description: "活动已从收藏夹中移除",
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">收藏夹</h1>
      <p className="text-muted-foreground">查看您收藏的志愿活动</p>

      {activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  {activity.isHot && <Badge className="bg-red-500">热门</Badge>}
                </div>
                <CardDescription>{activity.type}类活动</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{new Date(activity.startTime).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>
                      {new Date(activity.startTime).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -
                      {new Date(activity.endTime).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    <span>
                      已报名: {activity.participants.length}/{activity.maxParticipants}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFavorite(activity.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Heart className="mr-1 h-4 w-4 fill-current" />
                  取消收藏
                </Button>
                <Link href={`/volunteer/activities/details/${activity.id}`}>
                  <Button size="sm">查看详情</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">收藏夹为空</h3>
          <p className="text-muted-foreground mt-1">您还没有收藏任何活动</p>
          <div className="mt-4">
            <Link href="/volunteer/activities/overview">
              <Button>浏览活动</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
