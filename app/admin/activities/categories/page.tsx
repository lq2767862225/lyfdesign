"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

// 模拟API调用
const getCategories = async () => {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "1",
      name: "环境保护",
      description: "环境保护相关的志愿活动，包括垃圾分类宣传、植树造林、河道清理等。",
      color: "#10b981",
      activitiesCount: 12,
    },
    {
      id: "2",
      name: "校园活动",
      description: "校园活动相关的志愿活动，包括支教、课后辅导、图书馆管理等。",
      color: "#3b82f6",
      activitiesCount: 8,
    },
    {
      id: "3",
      name: "关怀老人",
      description: "关爱特殊群体的志愿活动，包括敬老院慰问、儿童关爱、残障人士帮扶等。",
      color: "#ec4899",
      activitiesCount: 15,
    },
  ]
}

// 模拟添加分类
const addCategory = async (category: any) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { ...category, id: Math.random().toString(36).substr(2, 9) }
}

// 模拟更新分类
const updateCategory = async (id: string, category: any) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { ...category, id }
}

// 模拟删除分类
const deleteCategory = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return true
}

export default function CategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#10b981",
  })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("获取数据失败", error)
        toast({
          title: "获取数据失败",
          description: "请稍后再试",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleOpenAddDialog = () => {
    setSelectedCategory(null)
    setFormData({
      name: "",
      description: "",
      color: "#10b981",
    })
    setFormError("")
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (category: any) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
    })
    setFormError("")
    setDialogOpen(true)
  }

  const handleOpenDeleteDialog = (category: any) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormError("")
  }

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.name.trim()) {
      setFormError("分类名称不能为空")
      return
    }

    try {
      if (selectedCategory) {
        // 更新分类
        const updatedCategory = await updateCategory(selectedCategory.id, formData)
        setCategories(categories.map((category) => (category.id === selectedCategory.id ? updatedCategory : category)))
        toast({
          title: "更新成功",
          description: "分类已成功更新",
        })
      } else {
        // 添加分类
        const newCategory = await addCategory({ ...formData, activitiesCount: 0 })
        setCategories([...categories, newCategory])
        toast({
          title: "添加成功",
          description: "新分类已成功添加",
        })
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("操作失败", error)
      toast({
        title: "操作失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    try {
      await deleteCategory(selectedCategory.id)
      setCategories(categories.filter((category) => category.id !== selectedCategory.id))
      toast({
        title: "删除成功",
        description: "分类已成功删除",
      })
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("删除失败", error)
      toast({
        title: "删除失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">活动分类管理</h1>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          添加分类
        </Button>
      </div>
      <p className="text-muted-foreground">管理志愿活动的分类</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                  <CardTitle>{category.name}</CardTitle>
                </div>
                <Badge>{category.activitiesCount}个活动</Badge>
              </div>
              <CardDescription className="line-clamp-2">{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: category.color + "40" }}></div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(category)}>
                <Pencil className="h-4 w-4 mr-1" />
                编辑
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={() => handleOpenDeleteDialog(category)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 添加/编辑分类对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "编辑分类" : "添加分类"}</DialogTitle>
            <DialogDescription>{selectedCategory ? "修改活动分类信息" : "创建新的活动分类"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">分类名称</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">分类描述</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">分类颜色</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-10 p-1"
                />
                <div className="w-full h-8 rounded" style={{ backgroundColor: formData.color }}></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>{selectedCategory ? "保存更改" : "添加分类"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除分类确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>删除分类</DialogTitle>
            <DialogDescription>确认删除此活动分类</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="py-4">
              <p>
                您确定要删除分类 <span className="font-bold">{selectedCategory.name}</span> 吗？
                {selectedCategory.activitiesCount > 0 && (
                  <span className="text-red-500">
                    此分类下有 {selectedCategory.activitiesCount} 个活动，删除分类可能会影响这些活动的分类显示。
                  </span>
                )}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
