"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Medal, TrendingUp, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RankingsPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("month")
  const [loading, setLoading] = useState(false)

  // 使用模拟数据
  const personalRankings = [
    { id: 1, name: "志愿者1", hours: 24, department: "计算机学院" },
    { id: 2, name: "志愿者2", hours: 18, department: "电子工程学院" },
    { id: 3, name: "志愿者3", hours: 5, department: "计算机学院" },
    { id: 4, name: "志愿者4", hours: 4.5, department: "机械工程学院" },
    { id: 5, name: "志愿者5", hours: 4, department: "经济管理学院" },
  ]

  const departmentRankings = [
    { id: 1, name: "计算机学院", hours: 29, volunteers: 45 },
    { id: 2, name: "电子工程学院", hours: 18, volunteers: 38 },
    { id: 3, name: "机械工程学院", hours: 12, volunteers: 30 },
    { id: 4, name: "经济管理学院", hours: 10, volunteers: 25 },
    { id: 5, name: "外国语学院", hours: 8, volunteers: 20 },
    { id: 6, name: "物理学院", hours: 7, volunteers: 15 },
    { id: 7, name: "化学学院", hours: 6, volunteers: 12 },
    { id: 8, name: "生物学院", hours: 5, volunteers: 10 },
    { id: 9, name: "数学学院", hours: 4, volunteers: 8 },
    { id: 10, name: "艺术学院", hours: 3, volunteers: 5 },
  ]

  const gradeRankings = [
    { id: 1, name: "2022级", count: 45, percentage: "35%" },
    { id: 2, name: "2023级", count: 38, percentage: "30%" },
    { id: 3, name: "2021级", count: 30, percentage: "25%" },
    { id: 4, name: "2024级", count: 12, percentage: "10%" },
  ]

  const monthlyTrend = [
    { month: "1月", hours: 120 },
    { month: "2月", hours: 150 },
    { month: "3月", hours: 180 },
    { month: "4月", hours: 200 },
    { month: "5月", hours: 0 },
  ]

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    setLoading(true)

    // 模拟加载数据
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">排行榜</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-500" />
              <CardTitle>个人服务时长排行榜</CardTitle>
            </div>
            <CardDescription>
              {period === "month" ? "本月" : period === "year" ? "本年度" : "全部时间"}个人志愿服务时长排名
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
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              <CardTitle>学院总时长排行榜</CardTitle>
            </div>
            <CardDescription>
              {period === "month" ? "本月" : period === "year" ? "本年度" : "全部时间"}学院志愿服务总时长排名
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentRankings.slice(0, 5).map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                        dept.id === 1
                          ? "bg-yellow-100 text-yellow-600"
                          : dept.id === 2
                            ? "bg-gray-100 text-gray-600"
                            : dept.id === 3
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {dept.id <= 3 ? <Medal className="h-4 w-4" /> : dept.id}
                    </div>
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">{dept.volunteers}名志愿者</p>
                    </div>
                  </div>
                  <div className="font-bold">{dept.hours}小时</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-green-500" />
              <CardTitle>年级服务热情排行榜</CardTitle>
            </div>
            <CardDescription>各年级志愿者参与活动人数排名</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeRankings.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                        grade.id === 1
                          ? "bg-yellow-100 text-yellow-600"
                          : grade.id === 2
                            ? "bg-gray-100 text-gray-600"
                            : grade.id === 3
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {grade.id <= 3 ? <Medal className="h-4 w-4" /> : grade.id}
                    </div>
                    <p className="font-medium">{grade.name}</p>
                  </div>
                  <div>
                    <span className="font-bold">{grade.count}人</span>
                    <span className="text-sm text-muted-foreground ml-2">({grade.percentage})</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
              <CardTitle>服务时长月度趋势</CardTitle>
            </div>
            <CardDescription>志愿服务时长月度变化趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between">
              {monthlyTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-12 bg-purple-100 rounded-t-md"
                    style={{
                      height: `${(item.hours / 200) * 180}px`,
                      minHeight: "20px",
                    }}
                  >
                    <div
                      className="w-full bg-purple-500 rounded-t-md"
                      style={{
                        height: `${(item.hours / 200) * 100}%`,
                        minHeight: "10px",
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs font-medium">{item.month}</div>
                  <div className="text-xs text-muted-foreground">{item.hours}h</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
