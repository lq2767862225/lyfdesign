"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getCurrentUser } from "@/lib/api"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

export default function CreditScorePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 模拟信誉分变化记录
  const creditHistory = [
    {
      id: "ch1",
      date: "2025-04-01",
      change: +3,
      reason: "初始分数",
      balance: 90,
    },
  ]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
        console.log(userData)
      } catch (error) {
        console.error("获取用户数据失败", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  const getCreditStatus = () => {
    if (!user) return { status: "unknown", message: "未知状态" }

    if (user.creditScore <= 0) {
      return {
        status: "blacklisted",
        message: "您当前处于志愿黑名单中，一周内不能报名参加志愿活动。",
      }
    } else if (user.creditScore < 3) {
      return {
        status: "warning",
        message: "您的信誉分较低，请积极参加志愿活动提高信誉分。",
      }
    } else {
      return {
        status: "good",
        message: "您的信誉分良好，可以正常参加志愿活动。",
      }
    }
  }

  const creditStatus = getCreditStatus()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">信誉分</h1>
      <p className="text-muted-foreground">查看您的信誉分变化详情</p>

      <Card>
        <CardHeader>
          <CardTitle>当前信誉分</CardTitle>
          <CardDescription>信誉分反映您参与志愿活动的信用状况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="text-6xl font-bold">{user?.creditScore || 0}</div>
            <Progress value={user?.creditScore || 0} max={3} className="w-full" />

            <div
              className={`mt-4 p-4 rounded-lg w-full ${
                creditStatus.status === "blacklisted"
                  ? "bg-red-50 border border-red-200"
                  : creditStatus.status === "warning"
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="flex items-start">
                {creditStatus.status === "blacklisted" && <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />}
                {creditStatus.status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />}
                {creditStatus.status === "good" && <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />}
                <div>
                  <p className="font-medium">
                    {creditStatus.status === "blacklisted"
                      ? "黑名单状态"
                      : creditStatus.status === "warning"
                        ? "警告状态"
                        : "良好状态"}
                  </p>
                  <p className="text-sm mt-1">{creditStatus.message}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>信誉分变化记录</CardTitle>
          <CardDescription>展示最近的信誉分变动情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {creditHistory.map((record) => (
              <div key={record.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{record.reason}</p>
                  <p className="text-sm text-muted-foreground">{record.date}</p>
                </div>
                <div className={`font-bold ${record.change > 0 ? "text-green-500" : "text-red-500"}`}>
                  {record.change > 0 ? "+" : ""}
                  {record.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
