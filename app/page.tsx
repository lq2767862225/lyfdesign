import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function Home() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* 可选：添加背景图案或纹理 */}
            <div className="absolute inset-0 z-0 opacity-10">
                <Image src="/background.jpg" alt="Background pattern" fill className="object-cover" priority />
            </div>

            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
                <div className="w-full max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">志愿者管理系统</h1>
                        <p className="text-muted-foreground mt-2">请登录以继续使用系统</p>
                    </div>
                    <LoginForm />
                </div>
            </main>
        </div>
    )
}
