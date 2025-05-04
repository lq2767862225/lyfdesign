import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">志愿者管理系统</h1>
          <p className="text-muted-foreground mt-2">请登录以继续使用系统</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
