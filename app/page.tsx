import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function Home() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 relative">
            {/* 背景图容器 */}
            <div className="absolute inset-0 z-0 opacity-100">
                <Image
                    src="/background.png"
                    alt="Background pattern"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* 登录框定位容器 */}
            <main className="relative z-10 min-h-screen flex items-center"> {/* 新增 flex 和 items-center */}
                <div className="p-4 max-w-md ml-[18rem]"> {/* 移除 absolute 定位，添加左边距 ml-8 */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">校园志愿服务管理系统</h1>
                        <p className="text-muted-foreground mt-2">请登录以继续使用系统</p>
                    </div>
                    <LoginForm />
                </div>
            </main>
        </div>
    )
}