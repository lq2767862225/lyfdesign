"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, LucidePieChart, TrendingUp, Users } from "lucide-react"
import { getActivities, getCurrentUser } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, PieChart, Pie, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

export default function ManagerMonthlyReportPage() {
  const { toast } = useToast()
  const [month, setMonth] = useState("4")
  const [year, setYear] = useState("2025")
  const [exportFormat, setExportFormat] = useState("excel")
  const [activities, setActivities] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  // 模拟月度数据
  const monthlyData = {
    summary: {
      totalActivities: 2,
      completedActivities: 1,
      totalParticipants: 4,
      totalServiceHours: 7,
      averageServiceHours: 3.5,
    },
    activityTypes: [
      { type: "环保", count: 1, percentage: 50 },
      { type: "关爱", count: 1, percentage: 50 },
    ],
    departmentParticipation: [
      { department: "计算机学院", count: 2, percentage: 50 },
      { department: "电子工程学院", count: 1, percentage: 25 },
      { department: "机械工程学院", count: 1, percentage: 25 },
    ],
    weeklyTrend: [
      { week: "第1周", hours: 0 },
      { week: "第2周", hours: 0 },
      { week: "第3周", hours: 3 },
      { week: "第4周", hours: 4 },
    ],
  }

  const handleExport = () => {
    // 模拟导出报表
    toast({
      title: "报表导出中",
      description: `正在导出 ${year}年${month}月 的报表，格式：${exportFormat}`,
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
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
      <p className="text-muted-foreground">查看和导出您负责活动的月度统计报表</p>

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
              较上月 <span className="text-green-500">+2</span>
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
              较上月 <span className="text-green-500">+3</span>
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
              较上月 <span className="text-green-500">+0.5</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <LucidePieChart className="mr-2 h-5 w-5" />
              <CardTitle>活动类型分布</CardTitle>
            </div>
            <CardDescription>按活动类型统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <PieChart width={400} height={300}>
                <Pie
                  data={monthlyData.activityTypes.map((item, index) => ({
                    name: item.type,
                    value: item.count,
                    fill: ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"][index % 5],
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                />
                <Tooltip formatter={(value, name) => [`${value}个`, name]} />
              </PieChart>
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
            <div className="h-80 flex items-center justify-center">
              <LineChart
                width={400}
                height={300}
                data={monthlyData.weeklyTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}小时`, "服务时长"]} />
                <Line type="monotone" dataKey="hours" stroke="#10b981" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
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
