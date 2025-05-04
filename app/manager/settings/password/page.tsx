"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check } from "lucide-react"
import { getCurrentUser, updateUserPassword } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AdminPasswordPage() {
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
      setError("发生错误，请稍后再试")
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
          <div className="mb-6 text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">修改密码</h1>
            <p className="text-sm text-muted-foreground/90">更新您的账户密码</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="currentPassword" className="text-sm">当前密码</Label>
              <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm">新密码</Label>
              <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="h-9 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">密码长度至少为6位</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">确认新密码</Label>
              <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-9 text-sm"
              />
            </div>

            <Button
                type="submit"
                className="w-full h-9 text-sm font-medium mt-4"
                disabled={loading}
            >
              {loading ? "正在提交..." : "立即更新"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground/80">
            <p>校园志愿服务管理系统</p>
          </div>
        </div>
      </div>
  )
}