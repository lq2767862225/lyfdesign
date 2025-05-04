"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Clock, MapPin, QrCode, Users } from "lucide-react"
import { getActivities, getUsers } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CheckInPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [selectedActivity, setSelectedActivity] = useState<string>("")
  const [checkInCode, setCheckInCode] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [checkedInUsers, setCheckedInUsers] = useState<string[]>([])
  const [manualCheckInId, setManualCheckInId] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取活动列表
        const activitiesData = await getActivities()
        // 只显示已审批的活动
        const approvedActivities = activitiesData.filter(
          (activity: any) => activity.status === "approved" && new Date(activity.startTime) > new Date(),
        )
        setActivities(approvedActivities)

        if (approvedActivities.length > 0) {
          setSelectedActivity(approvedActivities[0].id)

          // 获取志愿者列表
          const usersData = await getUsers("volunteer")
          setVolunteers(usersData)
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

  useEffect(() => {
    // 当选择活动变化时，生成新的签到码
    if (selectedActivity) {
      // 生成6位随机数字签到码
      const newCode = Math.floor(100000 + Math.random() * 900000).toString()
      setCheckInCode(newCode)
      // 重置已签到用户
      setCheckedInUsers([])
    }
  }, [selectedActivity])

  const handleActivityChange = (activityId: string) => {
    setSelectedActivity(activityId)
  }

  const handleManualCheckIn = () => {
    if (!manualCheckInId) {
      toast({
        title: "请选择志愿者",
        variant: "destructive",
      })
      return
    }

    if (checkedInUsers.includes(manualCheckInId)) {
      toast({
        title: "该志愿者已签到",
        variant: "destructive",
      })
      return
    }

    // 添加到已签到列表
    setCheckedInUsers([...checkedInUsers, manualCheckInId])
    setManualCheckInId("")

    toast({
      title: "签到成功",
      description: `${volunteers.find((v) => v.id === manualCheckInId)?.name} 已成功签到`,
    })
  }

  const getSelectedActivity = () => {
    return activities.find((activity) => activity.id === selectedActivity)
  }

  const getParticipants = () => {
    const activity = getSelectedActivity()
    if (!activity) return []

    return volunteers.filter((volunteer) => activity.participants.includes(volunteer.id))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  const activity = getSelectedActivity()
  const participants = getParticipants()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">活动签到</h1>
      <p className="text-muted-foreground">管理志愿者活动签到</p>

      {activities.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>选择活动</CardTitle>
              <CardDescription>请选择需要进行签到的活动</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedActivity} onValueChange={handleActivityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择活动" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.title} ({new Date(activity.startTime).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedActivity && (
            <Tabs defaultValue="qrcode">
              <TabsList>
                <TabsTrigger value="qrcode">二维码签到</TabsTrigger>
                <TabsTrigger value="manual">手动签到</TabsTrigger>
                <TabsTrigger value="status">签到状态</TabsTrigger>
              </TabsList>

              <TabsContent value="qrcode" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>二维码签到</CardTitle>
                    <CardDescription>生成签到二维码，志愿者可通过扫描二维码进行签到</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-4 border">
                      <QrCode className="w-32 h-32 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold mb-2">签到码: {checkInCode}</p>
                      <p className="text-sm text-muted-foreground">有效期: 30分钟</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button
                      onClick={() => {
                        const newCode = Math.floor(100000 + Math.random() * 900000).toString()
                        setCheckInCode(newCode)
                        toast({
                          title: "签到码已刷新",
                        })
                      }}
                    >
                      刷新签到码
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>手动签到</CardTitle>
                    <CardDescription>为志愿者手动进行签到操作</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="volunteer">选择志愿者</Label>
                        <Select value={manualCheckInId} onValueChange={setManualCheckInId}>
                          <SelectTrigger id="volunteer">
                            <SelectValue placeholder="选择志愿者" />
                          </SelectTrigger>
                          <SelectContent>
                            {participants.map((volunteer) => (
                              <SelectItem
                                key={volunteer.id}
                                value={volunteer.id}
                                disabled={checkedInUsers.includes(volunteer.id)}
                              >
                                {volunteer.name} {checkedInUsers.includes(volunteer.id) ? "(已签到)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={handleManualCheckIn} disabled={!manualCheckInId}>
                        确认签到
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="status" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>签到状态</CardTitle>
                        <CardDescription>查看志愿者签到情况</CardDescription>
                      </div>
                      <Badge>
                        已签到: {checkedInUsers.length}/{participants.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activity && (
                      <div className="mb-4 p-4 bg-muted rounded-lg">
                        <h3 className="font-medium">{activity.title}</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>{new Date(activity.startTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>
                              {new Date(activity.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -
                              {new Date(activity.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            <span>{activity.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            <span>已报名: {participants.length}人</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {participants.length > 0 ? (
                      <div className="space-y-3">
                        {participants.map((volunteer) => (
                          <div
                            key={volunteer.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              checkedInUsers.includes(volunteer.id) ? "bg-green-50 border-green-200" : ""
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={volunteer.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{volunteer.name}</p>
                                <p className="text-xs text-muted-foreground">{volunteer.department}</p>
                              </div>
                            </div>
                            {checkedInUsers.includes(volunteer.id) ? (
                              <Badge className="bg-green-500">
                                <Check className="mr-1 h-3 w-3" /> 已签到
                              </Badge>
                            ) : (
                              <Badge variant="outline">未签到</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">暂无志愿者报名参加该活动</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">暂无可签到的活动</h3>
          <p className="text-muted-foreground mt-1">当有新的活动时会显示在这里</p>
        </div>
      )}
    </div>
  )
}
