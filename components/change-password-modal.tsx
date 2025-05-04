"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserPassword, getCurrentUser } from "@/lib/api"
import { useRouter } from "next/navigation"

export function ChangePasswordModal() {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkFirstLogin = async () => {
      const user = await getCurrentUser()
      if (user && user.firstLogin) {
        setOpen(true)
      }
    }

    checkFirstLogin()
  }, [])

  const handleSubmit = async () => {
    setError("")

    if (password.length < 6) {
      setError("密码长度不能少于6位")
      return
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (user) {
        const success = await updateUserPassword(user.id, password)
        if (success) {
          setOpen(false)
          // 刷新页面以更新用户状态
          router.refresh()
        } else {
          setError("密码修改失败，请稍后再试")
        }
      }
    } catch (err) {
      setError("发生错误，请稍后再试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>首次登录修改密码</DialogTitle>
          <DialogDescription>为了您的账户安全，首次登录需要修改默认密码。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-password" className="text-right">
              新密码
            </Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-password" className="text-right">
              确认密码
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "提交中..." : "确认修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
