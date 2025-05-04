"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileUp } from "lucide-react"
import { getActivities, getCurrentUser, updateActivity } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ActivityMaterialsPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [materialDescription, setMaterialDescription] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (user) {
          const activitiesData = await getActivities()
          // 筛选出当前负责人负责的已完成但未上传材料的活动
          const myActivities = activitiesData.filter(
            (activity: any) =>
              activity.managerId === user.id &&
              activity.status === "approved" &&
              new Date(activity.endTime) < new Date() &&
              !activity.materials,
          )
          setActivities(myActivities)

          if (myActivities.length > 0) {
            setSelectedActivity(myActivities[0].id)
          }
        }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files)
    }
  }

  const handleUpload = async () => {
    if (!selectedActivity || !selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "请选择文件",
        description: "请至少上传一个活动证明材料",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // 模拟上传文件
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 更新活动材料信息
      await updateActivity(selectedActivity, {
        materials: {
          description: materialDescription,
          files: Array.from(selectedFiles).map((file) => file.name),
          uploadedAt: new Date().toISOString(),
        },
      })

      // 更新本地活动列表
      setActivities(activities.filter((activity) => activity.id !== selectedActivity))

      toast({
        title: "上传成功",
        description: "活动证明材料已成功上传",
      })

      // 重置表单
      setMaterialDescription("")
      setSelectedFiles(null)
      setSelectedActivity(activities.length > 1 ? activities[1].id : null)
    } catch (error) {
      console.error("上传失败", error)
      toast({
        title: "上传失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">活动证明材料</h1>
      <p className="text-muted-foreground">上传活动证明材料，用于活动认证和志愿时长核算</p>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">待上传 ({activities.length})</TabsTrigger>
          <TabsTrigger value="uploaded">已上传</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>选择活动</CardTitle>
                  <CardDescription>请选择需要上传证明材料的活动</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`p-4 cursor-pointer hover:bg-muted ${
                          selectedActivity === activity.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedActivity(activity.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.startTime).toLocaleDateString("zh-CN")}
                            </p>
                          </div>
                          <Badge variant="outline">待上传</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                {selectedActivity ? (
                  <>
                    <CardHeader>
                      <CardTitle>上传证明材料</CardTitle>
                      <CardDescription>请上传活动照片、签到表等证明材料，用于活动认证和志愿时长核算</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="description">材料说明</Label>
                          <Textarea
                            id="description"
                            placeholder="请简要描述上传的材料内容"
                            value={materialDescription}
                            onChange={(e) => setMaterialDescription(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="files">上传文件</Label>
                          <div className="border-2 border-dashed rounded-md p-6 text-center">
                            <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              拖放文件到此处，或{" "}
                              <label htmlFor="file-upload" className="text-primary hover:underline cursor-pointer">
                                浏览文件
                              </label>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">支持 JPG, PNG, PDF 格式，最大 10MB</p>
                            <Input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              multiple
                              onChange={handleFileChange}
                            />
                          </div>
                          {selectedFiles && selectedFiles.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">已选择 {selectedFiles.length} 个文件:</p>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {Array.from(selectedFiles).map((file, index) => (
                                  <li key={index}>{file.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleUpload} disabled={uploading}>
                        {uploading ? "上传中..." : "上传材料"}
                      </Button>
                    </CardFooter>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">请选择一个活动</div>
                )}
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">暂无待上传材料的活动</h3>
              <p className="text-muted-foreground mt-1">所有活动的证明材料已上传完成</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="uploaded" className="mt-4">
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium">暂无已上传材料的活动</h3>
            <p className="text-muted-foreground mt-1">您还没有上传过活动证明材料</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
