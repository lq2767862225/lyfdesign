import type React from "react"
import { MainSidebar } from "@/components/main-sidebar"
import { ChangePasswordModal } from "@/components/change-password-modal"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { UserProfile } from "@/components/user-profile"

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <MainSidebar className="fixed h-screen w-64 z-30" />
      <div className="flex-grow flex flex-col ml-64">
        <header className="sticky top-0 z-20 border-b p-4 flex items-center justify-between bg-background bg-[#FCF1F0]" >
          <BreadcrumbNav />
          <UserProfile />
        </header>
        <main className="flex-grow p-6 overflow-auto">{children}</main>
      </div>
      <ChangePasswordModal />
    </div>
  )
}
