"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart,
  Settings,
  ClipboardList,
  Award,
  Heart,
} from "lucide-react"
import { getCurrentUser, logout } from "@/lib/api"
import { useRouter } from "next/navigation"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
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

  // 根据用户角色获取不同的导航项
  const getNavItems = () => {
    if (!user) return []

    switch (user.role) {
      case "administrator":
        return [
          {
            title: "工作台",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
            submenu: [],
          },
          {
            title: "活动监管",
            href: "/admin/activities",
            icon: ClipboardList,
            submenu: [
              { title: "活动审批", href: "/admin/activities/approval" },
              { title: "证明材料审批", href: "/admin/activities/materials" },
              { title: "历史活动", href: "/admin/activities/history" },
            ],
          },
          {
            title: "用户管理",
            href: "/admin/users",
            icon: Users,
            submenu: [
              { title: "志愿者管理", href: "/admin/users/volunteers" },
              { title: "负责人管理", href: "/admin/users/managers" },
            ],
          },
          {
            title: "数据分析",
            href: "/admin/analytics",
            icon: BarChart,
            submenu: [
              { title: "活动排行榜", href: "/admin/analytics/rankings" },
              { title: "活动预警", href: "/admin/analytics/warnings" },
              { title: "月度报表", href: "/admin/analytics/monthly-report" },
            ],
          },
          {
            title: "设置",
            href: "/admin/settings",
            icon: Settings,
            submenu: [
              { title: "个人信息", href: "/admin/settings/profile" },
              { title: "修改密码", href: "/admin/settings/password" },
            ],
          },
        ]
      case "manager":
        return [
          {
            title: "工作台",
            href: "/manager/dashboard",
            icon: LayoutDashboard,
            submenu: [],
          },
          {
            title: "活动管理",
            href: "/manager/activities",
            icon: ClipboardList,
            submenu: [
              { title: "活动申报", href: "/manager/activities/create" },
              { title: "我的活动", href: "/manager/activities/my-activities" },
              { title: "活动证明", href: "/manager/activities/materials" },
            ],
          },
          {
            title: "志愿者管理",
            href: "/manager/volunteers",
            icon: Users,
            submenu: [],
          },
          {
            title: "通讯中心",
            href: "/manager/communication",
            icon: MessageSquare,
            submenu: [
              { title: "签到", href: "/manager/communication/check-in" },
              { title: "群组聊天", href: "/manager/communication/chats" },
            ],
          },
          {
            title: "数据报表",
            href: "/manager/reports",
            icon: BarChart,
            submenu: [
              { title: "排行榜", href: "/manager/reports/rankings" },
              { title: "月度报表", href: "/manager/reports/monthly" },
            ],
          },
          {
            title: "设置",
            href: "/manager/settings",
            icon: Settings,
            submenu: [
              { title: "个人信息", href: "/manager/settings/profile" },
              { title: "修改密码", href: "/manager/settings/password" },
            ],
          },
        ]
      case "volunteer":
        return [
          {
            title: "首页",
            href: "/volunteer/home",
            icon: Home,
            submenu: [
              { title: "公告", href: "/volunteer/home/announcements" },
              { title: "热门活动", href: "/volunteer/home/hot-activities" },
            ],
          },
          {
            title: "志愿活动",
            href: "/volunteer/activities",
            icon: ClipboardList,
            submenu: [
              { title: "活动总览", href: "/volunteer/activities/overview" },
              { title: "活动日历", href: "/volunteer/activities/calendar" },
              { title: "历史参与", href: "/volunteer/activities/history" },
              { title: "收藏夹", href: "/volunteer/activities/favorites" },
            ],
          },
          {
            title: "排行榜单",
            href: "/volunteer/rankings",
            icon: Award,
            submenu: [],
          },
          {
            title: "通讯中心",
            href: "/volunteer/messages",
            icon: MessageSquare,
            submenu: [
              { title: "系统消息", href: "/volunteer/messages/system" },
              { title: "群组消息", href: "/volunteer/messages/groups" },
            ],
          },
          {
            title: "个人中心",
            href: "/volunteer/profile",
            icon: Heart,
            submenu: [
              { title: "个人档案", href: "/volunteer/profile/info" },
              { title: "服务记录", href: "/volunteer/profile/service-records" },
              { title: "信誉分", href: "/volunteer/profile/credit" },
            ],
          },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className={cn("pb-12 border-r h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">志愿者管理系统</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1 px-2">
            {navItems.map((item, i) => (
              <div key={i} className="mb-4">
                <Link href={item.href}>
                  <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
                {item.submenu && item.submenu.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem, j) => (
                      <Link key={j} href={subItem.href}>
                        <Button
                          variant={pathname === subItem.href ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          size="sm"
                        >
                          {subItem.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
