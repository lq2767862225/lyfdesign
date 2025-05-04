"use client"

import {useState, useEffect, useRef} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Medal, TrendingUp, Users } from "lucide-react"
import { getActivities, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts"

export default function ManagerRankingsPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("month")
  const [loading, setLoading] = useState(true)

  const [activities, setActivities] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 模拟排行榜数据
  const personalRankings = [
    { id: 1, name: "李志愿", hours: 24, department: "计算机学院" },
    { id: 2, name: "王小明", hours: 18, department: "电子工程学院" },
    { id: 3, name: "赵小红", hours: 5, department: "计算机学院" },
    { id: 4, name: "张三", hours: 4.5, department: "机械工程学院" },
    { id: 5, name: "李四", hours: 4, department: "经济管理学院" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesData, userData] = await Promise.all([getActivities(), getCurrentUser()])

        // 筛选出当前负责人的活动
        const managerActivities = activitiesData.filter((activity) => activity.managerId === userData.id)

        setActivities(managerActivities)
        setCurrentUser(userData)
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

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    setLoading(true)

    // 模拟加载数据
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">活动排行榜</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">时间范围：</span>
          <Tabs value={period} onValueChange={handlePeriodChange}>
            <TabsList>
              <TabsTrigger value="month">月度</TabsTrigger>
              <TabsTrigger value="year">年度</TabsTrigger>
              <TabsTrigger value="all">全部</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <p className="text-muted-foreground">查看您负责活动的志愿者排行榜</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-500" />
              <CardTitle>志愿者服务时长排行榜</CardTitle>
            </div>
            <CardDescription>
              {period === "month" ? "本月" : period === "year" ? "本年度" : "全部时间"}志愿者服务时长排名
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personalRankings.slice(0, 5).map((person) => (
                <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                        person.id === 1
                          ? "bg-yellow-100 text-yellow-600"
                          : person.id === 2
                            ? "bg-gray-100 text-gray-600"
                            : person.id === 3
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {person.id <= 3 ? <Medal className="h-4 w-4" /> : person.id}
                    </div>
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.department}</p>
                    </div>
                  </div>
                  <div className="font-bold">{person.hours}小时</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
              <CardTitle>活动参与度趋势</CardTitle>
            </div>
            <CardDescription>志愿者参与活动的月度变化趋势</CardDescription>
          </CardHeader>
          <CardContent className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%" maxHeight={500}>
              <LineChart
                  data={[
                    { month: "1月", participants: 8 },
                    { month: "2月", participants: 12 },
                    { month: "3月", participants: 15 },
                    { month: "4月", participants: 10 },
                    { month: "5月", participants: 5 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="participants" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            <CardTitle>活动类型分布</CardTitle>
          </div>
          <CardDescription>按活动类型统计参与人数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "环保", count: 12, percentage: 40 },
              { type: "关爱", count: 9, percentage: 30 },
              { type: "教育", count: 6, percentage: 20 },
              { type: "科技", count: 3, percentage: 10 },
            ].map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-sm">
                    {item.count}人 ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
