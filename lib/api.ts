// lib/api.ts

import { mockUsers, mockActivities, mockAnnouncements, mockChats, mockTasks, mockReports } from "./mock"

// 用户相关API
export async function login(username: string, password: string) {
  // 模拟登录验证
  const user = mockUsers.find((user) => user.username === username && user.password === password)

  if (user) {
    // 模拟存储用户会话
    localStorage.setItem(
      "currentUser",
      JSON.stringify(user),
    )
    return user
  }

  return null
}

export async function getCurrentUser() {
  // 从本地存储获取当前用户
  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null

  return JSON.parse(userStr)
}

export async function logout() {
  localStorage.removeItem("currentUser")
}

export async function updateUserPassword(userId: string, newPassword: string) {
  // 模拟更新密码
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex].password = newPassword
    mockUsers[userIndex].firstLogin = false
    return true
  }
  return false
}

export async function updateUserProfile(userId: string, profileData: any) {
  // 模拟更新用户资料
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...profileData }
    return mockUsers[userIndex]
  }
  return null
}

// 活动相关API
export async function getActivities(filters = {}) {
  // 模拟获取活动列表，可以根据filters过滤
  return mockActivities
}

export async function getActivityById(id: string) {
  return mockActivities.find((activity) => activity.id === id) || null
}

export async function createActivity(activityData: any) {
  // 模拟创建新活动
  const newActivity = {
    id: `act-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    participants: [],
    ...activityData,
  }

  mockActivities.push(newActivity)

  // 自动创建群聊
  createChat({
    id: `chat-${newActivity.id}`,
    type: "group",
    name: `${newActivity.title}活动群`,
    participants: [newActivity.managerId],
    messages: [],
  })

  return newActivity
}

export async function updateActivity(id: string, activityData: any) {
  const activityIndex = mockActivities.findIndex((activity) => activity.id === id)
  if (activityIndex !== -1) {
    mockActivities[activityIndex] = { ...mockActivities[activityIndex], ...activityData }
    return mockActivities[activityIndex]
  }
  return null
}

export async function deleteActivity(id: string) {
  const activityIndex = mockActivities.findIndex((activity) => activity.id === id)
  if (activityIndex !== -1) {
    mockActivities.splice(activityIndex, 1)
    return true
  }
  return false
}

export async function joinActivity(activityId: string, userId: string) {
  const activity = mockActivities.find((activity) => activity.id === activityId)
  const user = mockUsers.find((user) => user.id === userId)

  if (!activity || !user) return { success: false, message: "活动或用户不存在" }
  if (user.creditScore <= 0) return { success: false, message: "信誉分不足，无法报名" }
  if (activity.participants.includes(userId)) return { success: false, message: "您已报名此活动" }

  // 检查活动是否已满
  if (activity.participants.length >= activity.maxParticipants) {
    return { success: false, message: "活动名额已满" }
  }

  // 添加用户到活动参与者
  activity.participants.push(userId)

  // 将用户添加到活动群聊
  const chat = mockChats.find((chat) => chat.id === `chat-${activity.id}`)
  if (chat && !chat.participants.includes(userId)) {
    chat.participants.push(userId)
  }

  return { success: true, message: "报名成功" }
}

export async function approveActivityMaterials(activityId: string) {
  const activityIndex = mockActivities.findIndex((activity) => activity.id === activityId)
  if (activityIndex !== -1 && mockActivities[activityIndex].materials) {
    mockActivities[activityIndex].materials = {
      ...mockActivities[activityIndex].materials,
      approved: true,
      rejected: false,
      approvedAt: new Date().toISOString(),
      approvedBy: "系统管理员",
    }
    return true
  }
  return false
}

export async function rejectActivityMaterials(activityId: string, reason: string) {
  const activityIndex = mockActivities.findIndex((activity) => activity.id === activityId)
  if (activityIndex !== -1 && mockActivities[activityIndex].materials) {
    mockActivities[activityIndex].materials = {
      ...mockActivities[activityIndex].materials,
      approved: false,
      rejected: true,
      rejectedAt: new Date().toISOString(),
      rejectedBy: "系统管理员",
      rejectionReason: reason,
    }
    return true
  }
  return false
}

// 公告相关API
export async function getAnnouncements() {
  return mockAnnouncements
}

export async function createAnnouncement(announcementData: any) {
  const newAnnouncement = {
    id: `ann-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...announcementData,
  }

  mockAnnouncements.push(newAnnouncement)
  return newAnnouncement
}

export async function updateAnnouncement(id: string, announcementData: any) {
  const announcementIndex = mockAnnouncements.findIndex((announcement) => announcement.id === id)
  if (announcementIndex !== -1) {
    mockAnnouncements[announcementIndex] = { ...mockAnnouncements[announcementIndex], ...announcementData }
    return mockAnnouncements[announcementIndex]
  }
  return null
}

export async function deleteAnnouncement(id: string) {
  const announcementIndex = mockAnnouncements.findIndex((announcement) => announcement.id === id)
  if (announcementIndex !== -1) {
    mockAnnouncements.splice(announcementIndex, 1)
    return true
  }
  return false
}

// 聊天相关API
export async function getChats(userId: string) {
  // 获取用户参与的所有聊天
  return mockChats.filter((chat) => chat.participants.includes(userId))
}

export async function getChatById(chatId: string) {
  return mockChats.find((chat) => chat.id === chatId) || null
}

export async function createChat(chatData: any) {
  const newChat = {
    id: chatData.id || `chat-${Date.now()}`,
    createdAt: new Date().toISOString(),
    messages: [],
    ...chatData,
  }

  mockChats.push(newChat)
  return newChat
}

export async function sendMessage(chatId: string, message: any) {
  const chat = mockChats.find((chat) => chat.id === chatId)
  if (!chat) return null

  const newMessage = {
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...message,
  }

  chat.messages.push(newMessage)
  return newMessage
}

// 任务相关API
export async function getTasks(userId?: string) {
  // 获取用户的待办任务
  if (userId) {
    return mockTasks.filter((task) => task.assigneeId === userId)
  }
  return mockTasks
}

export async function updateTask(taskId: string, taskData: any) {
  const taskIndex = mockTasks.findIndex((task) => task.id === taskId)
  if (taskIndex !== -1) {
    mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...taskData }
    return mockTasks[taskIndex]
  }
  return null
}

// 报表相关API
export async function getReports(type: string) {
  // 根据类型获取报表数据
  return mockReports[type] || []
}

// 用户管理API
export async function getUsers(role?: string) {
  if (role === "all") {
    return mockUsers
  }
  if (role) {
    return mockUsers.filter((user) => user.role === role)
  }
  return mockUsers
}

export async function updateUserRole(userId: string, newRole: string) {
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex].role = newRole
    return mockUsers[userIndex]
  }
  return null
}

// 用户管理API
export async function updateUserCredit(userId: string, newCreditScore: number) {
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex].creditScore = newCreditScore
    return mockUsers[userIndex]
  }
  return null
}
