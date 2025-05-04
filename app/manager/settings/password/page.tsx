"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check } from "lucide-react"
import { getCurrentUser, updateUserPassword } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ManagerPasswordPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    // 验证表单
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("请填写所有字段")
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError("新密码长度不能少于6位")
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("两次输入的新密码不一致")
      setLoading(false)
      return
    }

    try {
      const user = await getCurrentUser()
      if (user) {
        const success = await updateUserPassword(user.id, formData.newPassword)
        if (success) {
          setSuccess(true)
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
          toast({
            title: "密码修改成功",
            description: "您的密码已成功更新",
          })
        } else {
          setError("密码修改失败，请检查当前密码是否正确")
        }
      }
    } catch (err) {
      setError("���生错误，请稍后再试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">修改密码</h1>
      <p className="text-muted-foreground">更新您的账户密码</p>

      <Card className="max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>密码设置</CardTitle>
            <CardDescription>请输入您的当前密码和新密码</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4" />
                <AlertDescription>密码修改成功</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">密码长度至少为6位</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "提交中..." : "更新密码"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
