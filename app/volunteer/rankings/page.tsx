"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Medal, TrendingUp, Users } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export default function RankingsPage() {
  const [period, setPeriod] = useState("month")

  // 模拟排行榜数据
  const personalRankings = [
    { id: 1, name: "李志愿", hours: 24, department: "计算机学院" },
    { id: 2, name: "王小明", hours: 18, department: "电子工程学院" },
    { id: 3, name: "赵小红", hours: 5, department: "计算机学院" },
    { id: 4, name: "张三", hours: 4.5, department: "机械工程学院" },
    { id: 5, name: "李四", hours: 4, department: "经济管理学院" },
  ]

  const departmentRankings = [
    { id: 1, name: "计算机学院", hours: 29, volunteers: 45 },
    { id: 2, name: "电子工程学院", hours: 18, volunteers: 38 },
    { id: 3, name: "机械工程学院", hours: 12, volunteers: 30 },
    { id: 4, name: "经济管理学院", hours: 10, volunteers: 25 },
    { id: 5, name: "外国语学院", hours: 8, volunteers: 20 },
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">排行榜单</h1>
      <p className="text-muted-foreground">查看志愿服务排行榜和趋势</p>

      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">时间范围：</span>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="month">月度</TabsTrigger>
            <TabsTrigger value="year">年度</TabsTrigger>
            <TabsTrigger value="all">全部</TabsTrigger>
          </TabsList>
        </Tabs>
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
              {personalRankings.map((person) => (
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
              {departmentRankings.map((dept) => (
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
              <CardTitle>个人服务时长月度趋势</CardTitle>
            </div>
            <CardDescription>您的志愿服务时长月度变化趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer
                config={{
                  hours: {
                    label: "服务时长",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <LineChart
                  data={[
                    { month: "1月", hours: 120 },
                    { month: "2月", hours: 150 },
                    { month: "3月", hours: 180 },
                    { month: "4月", hours: 200 },
                    { month: "5月", hours: 0 },
                  ]}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
