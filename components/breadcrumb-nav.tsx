"use client"

import React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

// 路径映射表
const pathMap: Record<string, string> = {
  // 管理员路径
  admin: "管理员",
  dashboard: "工作台",
  activities: "活动管理",
  approval: "活动审批",
  materials: "证明材料",
  history: "历史活动",
  users: "用户管理",
  volunteers: "志愿者管理",
  managers: "负责人管理",
  blacklist: "黑名单管理",
  analytics: "数据分析",
  rankings: "排行榜",
  warnings: "活动预警",
  "monthly-report": "月度报表",
  settings: "设置",
  profile: "个人信息",
  password: "修改密码",
  system: "系统设置",
  announcements: "公告管理",

  // 志愿者路径
  volunteer: "志愿者",
  home: "首页",
  "hot-activities": "热门活动",
  calendar: "活动日历",
  overview: "活动总览",
  favorites: "收藏夹",
  credit: "信誉分",
  info: "个人档案",
  "service-records": "服务记录",
  messages: "通讯中心",
  // system: "系统消息",
  groups: "群组消息",

  // 负责人路径
  manager: "负责人",
  create: "活动申报",
  "my-activities": "我的活动",
  communication: "通讯中心",
  "check-in": "签到",
  chats: "群组聊天",
  reports: "数据报表",
  tasks: "待办事项",
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  // 如果是根路径，不显示面包屑
  if (pathname === "/") {
    return null
  }

  // 分割路径
  const pathSegments = pathname.split("/").filter(Boolean)

  // 构建面包屑项
  const breadcrumbItems = pathSegments.map((segment, index) => {
    // 构建当前路径
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`
    const isLast = index === pathSegments.length - 1

    // 获取显示名称
    const displayName = pathMap[segment] || segment

    return {
      href,
      displayName,
      isLast,
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>

        {/* 分隔符作为单独的元素，不嵌套在BreadcrumbItem中 */}
        <BreadcrumbSeparator />

        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.displayName}</BreadcrumbPage>
              ) : (
                <BreadcrumbItem>{item.displayName}</BreadcrumbItem>
              )}
            </BreadcrumbItem>

            {/* 只有在不是最后一项时才添加分隔符，且作为单独的元素 */}
            {!item.isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
