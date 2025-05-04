"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface CaptchaProps {
  onGenerate: (code: string) => void
}

export function Captcha({ onGenerate }: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [code, setCode] = useState("")

  const generateCaptcha = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 设置背景
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 生成随机验证码
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    let captchaCode = ""

    for (let i = 0; i < 4; i++) {
      const char = characters.charAt(Math.floor(Math.random() * characters.length))
      captchaCode += char

      // 随机颜色
      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)})`
      ctx.font = `${18 + Math.random() * 10}px Arial`

      // 随机旋转
      const x = 20 + i * 30
      const y = 25 + Math.random() * 10
      const angle = (Math.random() - 0.5) * 0.4

      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillText(char, 0, 0)
      ctx.rotate(-angle)
      ctx.translate(-x, -y)
    }

    // 添加干扰线
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)})`
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }

    // 添加干扰点
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)})`
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI)
      ctx.fill()
    }

    setCode(captchaCode)
    onGenerate(captchaCode)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  return (
    <div className="flex items-center">
      <canvas
        ref={canvasRef}
        width={140}
        height={40}
        className="border rounded-md cursor-pointer"
        onClick={generateCaptcha}
        title="点击刷新验证码"
      />
    </div>
  )
}
