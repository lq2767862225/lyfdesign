"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, PieChart, TrendingUp, Users } from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

export default function MonthlyReportPage() {
  const [month, setMonth] = useState("4")
  const [year, setYear] = useState("2025")
  const [exportFormat, setExportFormat] = useState("excel")

  // 模拟月度数据
  const monthlyData = {
    summary: {
      totalActivities: 12,
      completedActivities: 8,
      totalParticipants: 156,
      totalServiceHours: 468,
      averageServiceHours: 3.0,
    },
    activityTypes: [
      { type: "校园活动", count: 4, percentage: 33.3, value: 4 },
      { type: "环境保护", count: 3, percentage: 25.0, value: 3 },
      { type: "关爱老人", count: 2, percentage: 16.7, value: 2 },
    ],
    departmentParticipation: [
      { department: "计算机学院", count: 45, percentage: 28.8 },
      { department: "电子工程学院", count: 38, percentage: 24.4 },
      { department: "机械工程学院", count: 30, percentage: 19.2 },
      { department: "经济管理学院", count: 25, percentage: 16.0 },
      { department: "外国语学院", count: 18, percentage: 11.5 },
    ],
    weeklyTrend: [
      { week: "第1周", hours: 120, name: "第1周" },
      { week: "第2周", hours: 98, name: "第2周" },
      { week: "第3周", hours: 150, name: "第3周" },
      { week: "第4周", hours: 100, name: "第4周" },
    ],
  }

  // 饼图颜色
  const COLORS = ["#10b981", "#f59e0b", "#ef4444"]

  const handleExport = () => {
    // 模拟导出报表
    alert(`正在导出 ${year}年${month}月 的报表，格式：${exportFormat}`)
  }

  // 自定义饼图标签
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius * 1.1
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${name} (${(percent * 100).toFixed(1)}%)`}
      </text>
    )
  }

  // 配置图表颜色
  const chartConfig = {
    校园活动: { color: "#10b981" },
    环境保护: { color: "#f59e0b" },
    关怀老人: { color: "#ef4444" },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">月度报表</h1>
        <div className="flex items-center space-x-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="选择年份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024年</SelectItem>
              <SelectItem value="2025">2025年</SelectItem>
            </SelectContent>
          </Select>

          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="选择月份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1月</SelectItem>
              <SelectItem value="2">2月</SelectItem>
              <SelectItem value="3">3月</SelectItem>
              <SelectItem value="4">4月</SelectItem>
              <SelectItem value="5">5月</SelectItem>
              <SelectItem value="6">6月</SelectItem>
              <SelectItem value="7">7月</SelectItem>
              <SelectItem value="8">8月</SelectItem>
              <SelectItem value="9">9月</SelectItem>
              <SelectItem value="10">10月</SelectItem>
              <SelectItem value="11">11月</SelectItem>
              <SelectItem value="12">12月</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-muted-foreground">查看和导出志愿服务月度统计报表</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总活动数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyData.summary.totalActivities}个</div>
            <p className="text-xs text-muted-foreground">已完成: {monthlyData.summary.completedActivities}个</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">参与人次</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyData.summary.totalParticipants}人次</div>
            <p className="text-xs text-muted-foreground">
              较上月 <span className="text-green-500">+12%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总服务时长</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyData.summary.totalServiceHours}小时</div>
            <p className="text-xs text-muted-foreground">
              较上月 <span className="text-green-500">+8%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">人均服务时长</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyData.summary.averageServiceHours}小时</div>
            <p className="text-xs text-muted-foreground">
              较上月 <span className="text-red-500">-0.2</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              <CardTitle>活动类型分布</CardTitle>
            </div>
            <CardDescription>按活动类型统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer config={chartConfig}>
                <RechartsPieChart>
                  <Pie
                    data={monthlyData.activityTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="type"
                  >
                    {monthlyData.activityTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
                                <span className="font-medium">{data.type}</span>
                              </div>
                              <div className="text-right font-medium">{data.count}个</div>
                              <div className="text-muted-foreground">占比</div>
                              <div className="text-right text-muted-foreground">{data.percentage}%</div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </RechartsPieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              <CardTitle>周服务时长趋势</CardTitle>
            </div>
            <CardDescription>按周统计服务时长</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData.weeklyTrend}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <p className="font-medium">{label}</p>
                            <p className="text-primary">{`服务时长: ${payload[0].value} 小时`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    name="服务时长"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            <CardTitle>学院参与情况</CardTitle>
          </div>
          <CardDescription>按学院统计参与人数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.departmentParticipation.map((dept) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{dept.department}</span>
                  <span className="text-sm">
                    {dept.count}人 ({dept.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${dept.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              <CardTitle>导出报表</CardTitle>
            </div>
          </div>
          <CardDescription>导出月度报表数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">导出格式</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="选择导出格式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              导出报表
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
