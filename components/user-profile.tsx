"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { getCurrentUser, logout } from "@/lib/api"
import { useRouter } from "next/navigation"

export function UserProfile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "administrator":
        return "管理员"
      case "manager":
        return "负责人"
      case "volunteer":
        return "志愿者"
      default:
        return "用户"
    }
  }

  const getSettingsPath = (role: string) => {
    switch (role) {
      case "administrator":
        return "/admin/settings/profile"
      case "manager":
        return "/manager/settings/profile"
      case "volunteer":
        return "/volunteer/profile/info"
      default:
        return "/"
    }
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>加载中</AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end">
        <span className="font-medium text-sm">{user.name}</span>
        <span className="text-xs text-muted-foreground">{getRoleText(user.role)}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{getRoleText(user.role)}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(getSettingsPath(user.role))}>
            <User className="mr-2 h-4 w-4" />
            <span>个人信息</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/${user.role}/settings/password`)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>修改密码</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
