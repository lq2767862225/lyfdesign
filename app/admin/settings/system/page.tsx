"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Save, RefreshCw, Database, Shield, Clock, Award, Bell } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SystemSettingsPage() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // 通用设置
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "志愿者管理系统",
    schoolName: "示范大学",
    logo: "/logo.png",
    theme: "light",
    enableRegistration: true,
    requireApproval: true,
    maintenanceMode: false,
  })

  // 活动设置
  const [activitySettings, setActivitySettings] = useState({
    defaultMinParticipants: 5,
    defaultMaxParticipants: 30,
    minRegistrationDays: 3,
    maxActiveActivities: 50,
    allowSelfCancel: true,
    cancelDeadlineHours: 24,
    autoCompleteActivities: true,
  })

  // 积分设置
  const [creditSettings, setCreditSettings] = useState({
    initialCredit: 100,
    minCredit: 0,
    blacklistThreshold: 0,
    noShowPenalty: 10,
    lateCancelPenalty: 5,
    activityCompletionBonus: 2,
    excellentVolunteerThreshold: 80,
  })

  // 通知设置
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enableSystemNotifications: true,
    activityReminderHours: 24,
    sendDailyDigest: false,
    sendWeeklyReport: true,
    notifyAdminOnWarnings: true,
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleGeneralSwitchChange = (name: string, checked: boolean) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleGeneralSelectChange = (name: string, value: string) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setActivitySettings((prev) => ({
      ...prev,
      [name]: Number.parseInt(value, 10),
    }))
  }

  const handleActivitySwitchChange = (name: string, checked: boolean) => {
    setActivitySettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCreditSettings((prev) => ({
      ...prev,
      [name]: Number.parseInt(value, 10),
    }))
  }

  const handleCreditSliderChange = (name: string, value: number[]) => {
    setCreditSettings((prev) => ({
      ...prev,
      [name]: value[0],
    }))
  }

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: Number.parseInt(value, 10),
    }))
  }

  const handleNotificationSwitchChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSaveSettings = () => {
    setSaving(true)

    // 模拟保存设置
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "设置已保存",
        description: "系统设置已成功更新",
      })
    }, 1000)
  }

  const handleResetSettings = () => {
    // 根据当前活动的标签页重置相应设置
    if (activeTab === "general") {
      setGeneralSettings({
        systemName: "志愿者管理系统",
        schoolName: "示范大学",
        logo: "/logo.png",
        theme: "light",
        enableRegistration: true,
        requireApproval: true,
        maintenanceMode: false,
      })
    } else if (activeTab === "activity") {
      setActivitySettings({
        defaultMinParticipants: 5,
        defaultMaxParticipants: 30,
        minRegistrationDays: 3,
        maxActiveActivities: 50,
        allowSelfCancel: true,
        cancelDeadlineHours: 24,
        autoCompleteActivities: true,
      })
    } else if (activeTab === "credit") {
      setCreditSettings({
        initialCredit: 100,
        minCredit: 0,
        blacklistThreshold: 0,
        noShowPenalty: 10,
        lateCancelPenalty: 5,
        activityCompletionBonus: 2,
        excellentVolunteerThreshold: 80,
      })
    } else if (activeTab === "notification") {
      setNotificationSettings({
        enableEmailNotifications: true,
        enableSmsNotifications: false,
        enableSystemNotifications: true,
        activityReminderHours: 24,
        sendDailyDigest: false,
        sendWeeklyReport: true,
        notifyAdminOnWarnings: true,
      })
    }

    toast({
      title: "设置已重置",
      description: "已恢复默认设置",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重置设置
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "保存中..." : "保存设置"}
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">配置系统的全局设置</p>

      <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">通用设置</TabsTrigger>
          <TabsTrigger value="activity">活动设置</TabsTrigger>
          <TabsTrigger value="credit">积分设置</TabsTrigger>
          <TabsTrigger value="notification">通知设置</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                <CardTitle>基本信息</CardTitle>
              </div>
              <CardDescription>设置系统的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">系统名称</Label>
                <Input
                  id="systemName"
                  name="systemName"
                  value={generalSettings.systemName}
                  onChange={handleGeneralChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolName">学校名称</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={generalSettings.schoolName}
                  onChange={handleGeneralChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">系统Logo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="logo"
                    name="logo"
                    value={generalSettings.logo}
                    onChange={handleGeneralChange}
                    className="flex-1"
                  />
                  <Button variant="outline">上传</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">系统主题</Label>
                <Select
                  value={generalSettings.theme}
                  onValueChange={(value) => handleGeneralSelectChange("theme", value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="选择主题" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色主题</SelectItem>
                    <SelectItem value="dark">深色主题</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                <CardTitle>安全设置</CardTitle>
              </div>
              <CardDescription>配置系统的安全选项</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableRegistration">开放注册</Label>
                  <p className="text-sm text-muted-foreground">允许���用户注��系统</p>
                </div>
                <Switch
                  id="enableRegistration"
                  checked={generalSettings.enableRegistration}
                  onCheckedChange={(checked) => handleGeneralSwitchChange("enableRegistration", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireApproval">注册需要审批</Label>
                  <p className="text-sm text-muted-foreground">新用户注册后需要管理员审批</p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={generalSettings.requireApproval}
                  onCheckedChange={(checked) => handleGeneralSwitchChange("requireApproval", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">维护模式</Label>
                  <p className="text-sm text-muted-foreground">开启维护模式，仅管理员可访问系统</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => handleGeneralSwitchChange("maintenanceMode", checked)}
                />
              </div>
              {generalSettings.maintenanceMode && (
                <Alert variant="warning" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    维护模式已开启，普通用户将无法访问系统。请在维护完成后关闭此模式。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                <CardTitle>活动参数设置</CardTitle>
              </div>
              <CardDescription>配置活动的默认参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultMinParticipants">默认最小参与人数</Label>
                  <Input
                    id="defaultMinParticipants"
                    name="defaultMinParticipants"
                    type="number"
                    min="1"
                    value={activitySettings.defaultMinParticipants}
                    onChange={handleActivityChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultMaxParticipants">默认最大参与人数</Label>
                  <Input
                    id="defaultMaxParticipants"
                    name="defaultMaxParticipants"
                    type="number"
                    min="1"
                    value={activitySettings.defaultMaxParticipants}
                    onChange={handleActivityChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minRegistrationDays">最小提前报名天数</Label>
                  <Input
                    id="minRegistrationDays"
                    name="minRegistrationDays"
                    type="number"
                    min="0"
                    value={activitySettings.minRegistrationDays}
                    onChange={handleActivityChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxActiveActivities">最大同时进行活动数</Label>
                  <Input
                    id="maxActiveActivities"
                    name="maxActiveActivities"
                    type="number"
                    min="1"
                    value={activitySettings.maxActiveActivities}
                    onChange={handleActivityChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                <CardTitle>活动行为设置</CardTitle>
              </div>
              <CardDescription>配置活动的行为规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowSelfCancel">允许自行取消报名</Label>
                  <p className="text-sm text-muted-foreground">志愿者可以在截止时间前取消报名</p>
                </div>
                <Switch
                  id="allowSelfCancel"
                  checked={activitySettings.allowSelfCancel}
                  onCheckedChange={(checked) => handleActivitySwitchChange("allowSelfCancel", checked)}
                />
              </div>
              {activitySettings.allowSelfCancel && (
                <div className="space-y-2 pl-6 border-l-2 border-muted">
                  <Label htmlFor="cancelDeadlineHours">取消报名截止时间（小时）</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="cancelDeadlineHours"
                      min={1}
                      max={72}
                      step={1}
                      value={[activitySettings.cancelDeadlineHours]}
                      onValueChange={(value) => handleActivitySwitchChange("cancelDeadlineHours", value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{activitySettings.cancelDeadlineHours}小时</span>
                  </div>
                  <p className="text-xs text-muted-foreground">活动开始前多少小时内不允许取消报名</p>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoCompleteActivities">自动完成活动</Label>
                  <p className="text-sm text-muted-foreground">活动结束后自动标记为已完成</p>
                </div>
                <Switch
                  id="autoCompleteActivities"
                  checked={activitySettings.autoCompleteActivities}
                  onCheckedChange={(checked) => handleActivitySwitchChange("autoCompleteActivities", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                <CardTitle>信誉分规则</CardTitle>
              </div>
              <CardDescription>配置志愿者信誉分系统</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialCredit">初始信誉分</Label>
                  <Input
                    id="initialCredit"
                    name="initialCredit"
                    type="number"
                    value={creditSettings.initialCredit}
                    onChange={handleCreditChange}
                  />
                  <p className="text-xs text-muted-foreground">新注册志愿者的初始信誉分</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minCredit">最低信誉分</Label>
                  <Input
                    id="minCredit"
                    name="minCredit"
                    type="number"
                    value={creditSettings.minCredit}
                    onChange={handleCreditChange}
                  />
                  <p className="text-xs text-muted-foreground">信誉分最低可降至多少</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blacklistThreshold">黑名单阈值</Label>
                  <Input
                    id="blacklistThreshold"
                    name="blacklistThreshold"
                    type="number"
                    value={creditSettings.blacklistThreshold}
                    onChange={handleCreditChange}
                  />
                  <p className="text-xs text-muted-foreground">低于此分数将被列入黑名单</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excellentVolunteerThreshold">优秀志愿者阈值</Label>
                  <Input
                    id="excellentVolunteerThreshold"
                    name="excellentVolunteerThreshold"
                    type="number"
                    value={creditSettings.excellentVolunteerThreshold}
                    onChange={handleCreditChange}
                  />
                  <p className="text-xs text-muted-foreground">高于此分数将被认定为优秀志愿者</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                <CardTitle>奖惩规则</CardTitle>
              </div>
              <CardDescription>配置信誉分的奖惩规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>未到场扣分</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={[creditSettings.noShowPenalty]}
                    onValueChange={(value) => handleCreditSliderChange("noShowPenalty", value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">-{creditSettings.noShowPenalty}分</span>
                </div>
                <p className="text-xs text-muted-foreground">报名后未参加活动的扣分</p>
              </div>
              <div className="space-y-2">
                <Label>临时取消扣分</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    min={0}
                    max={30}
                    step={1}
                    value={[creditSettings.lateCancelPenalty]}
                    onValueChange={(value) => handleCreditSliderChange("lateCancelPenalty", value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">-{creditSettings.lateCancelPenalty}分</span>
                </div>
                <p className="text-xs text-muted-foreground">临近活动开始时取消报名的扣分</p>
              </div>
              <div className="space-y-2">
                <Label>完成活动奖励</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[creditSettings.activityCompletionBonus]}
                    onValueChange={(value) => handleCreditSliderChange("activityCompletionBonus", value)}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">+{creditSettings.activityCompletionBonus}分</span>
                </div>
                <p className="text-xs text-muted-foreground">成功完成一次活动的奖励分数</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                <CardTitle>通知渠道</CardTitle>
              </div>
              <CardDescription>配置系统通知的发送渠道</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableEmailNotifications">邮件通知</Label>
                  <p className="text-sm text-muted-foreground">通过邮件发送系统通知</p>
                </div>
                <Switch
                  id="enableEmailNotifications"
                  checked={notificationSettings.enableEmailNotifications}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("enableEmailNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableSmsNotifications">短信通知</Label>
                  <p className="text-sm text-muted-foreground">通过短信发送系统通知</p>
                </div>
                <Switch
                  id="enableSmsNotifications"
                  checked={notificationSettings.enableSmsNotifications}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("enableSmsNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableSystemNotifications">系统内通知</Label>
                  <p className="text-sm text-muted-foreground">在系统内发送通知</p>
                </div>
                <Switch
                  id="enableSystemNotifications"
                  checked={notificationSettings.enableSystemNotifications}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("enableSystemNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                <CardTitle>通知规则</CardTitle>
              </div>
              <CardDescription>配置系统通知的发送规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activityReminderHours">活动提醒时间（小时）</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="activityReminderHours"
                    min={1}
                    max={48}
                    step={1}
                    value={[notificationSettings.activityReminderHours]}
                    onValueChange={(value) => handleNotificationSwitchChange("activityReminderHours", value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{notificationSettings.activityReminderHours}小时</span>
                </div>
                <p className="text-xs text-muted-foreground">活动开始前多少小时发送提醒</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sendDailyDigest">每日摘要</Label>
                  <p className="text-sm text-muted-foreground">发送每日活动摘要</p>
                </div>
                <Switch
                  id="sendDailyDigest"
                  checked={notificationSettings.sendDailyDigest}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("sendDailyDigest", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sendWeeklyReport">周报告</Label>
                  <p className="text-sm text-muted-foreground">发送每周活动报告</p>
                </div>
                <Switch
                  id="sendWeeklyReport"
                  checked={notificationSettings.sendWeeklyReport}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("sendWeeklyReport", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyAdminOnWarnings">预警通知管理员</Label>
                  <p className="text-sm text-muted-foreground">当系统检测到预警时通知管理员</p>
                </div>
                <Switch
                  id="notifyAdminOnWarnings"
                  checked={notificationSettings.notifyAdminOnWarnings}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("notifyAdminOnWarnings", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
