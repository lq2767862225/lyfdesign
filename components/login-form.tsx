"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/lib/api"
import { Captcha } from "@/components/captcha"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaCode, setCaptchaCode] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // 验证码验证
    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      setError("验证码错误，请重新输入")
      setLoading(false)
      return
    }

    try {
      const user = await login(username, password)

      if (user) {
        // 根据用户角色重定向到不同的仪表盘
        if (user.role === "administrator") {
          router.push("/admin/dashboard")
        } else if (user.role === "manager") {
          router.push("/manager/dashboard")
        } else {
          router.push("/volunteer/home")
        }
      } else {
        setError("用户名或密码错误")
      }
    } catch (err) {
      setError("登录失败，请稍后再试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>用户登录</CardTitle>
        <CardDescription>请输入您的账号和密码</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="captcha">验证码</Label>
            <div className="flex items-center gap-3">
              <Input
                id="captcha"
                placeholder="请输入验证码"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                className="flex-1"
              />
              <Captcha onGenerate={(code) => setCaptchaCode(code)} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">如忘记密码，请联系系统管理员</p>
      </CardFooter>
    </Card>
  )
}
