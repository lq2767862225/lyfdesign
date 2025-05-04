"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCurrentUser } from "@/lib/api"

type UserRole = "administrator" | "manager" | "volunteer" | null
type UserData = {
  id: string
  name: string
  role: UserRole
  avatar?: string
} | null

interface SidebarContextType {
  user: UserData
  loading: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("获取用户数据失败", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return <SidebarContext.Provider value={{ user, loading }}>{children}</SidebarContext.Provider>
}
