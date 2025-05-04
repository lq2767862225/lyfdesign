import type React from "react"
import { MainSidebar } from "@/components/main-sidebar"
import { ChangePasswordModal } from "@/components/change-password-modal"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { UserProfile } from "@/components/user-profile"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="fixed h-screen w-64 flex-shrink-0">
        <MainSidebar className="h-full w-full" />
      </div>
      <div className="ml-64 flex-grow flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background p-4 flex items-center justify-between bg-[#FCF1F0]">
          <BreadcrumbNav />
          <UserProfile />
        </header>
        <main className="flex-grow p-6 overflow-auto">{children}</main>
      </div>
      <ChangePasswordModal />
    </div>
  )
}
