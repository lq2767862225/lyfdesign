// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1/api"
});

export async function login(username: string, password: string) {
  const res = await api.post("/auth/login", { email: username, password });
  const user = res.data;
  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
}

export async function getCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return null;
  return JSON.parse(userStr);
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const res = await api.put(`/auth/${userId}/password`, { newPassword });
  return res.status === 200;
}

export async function updateUserProfile(userId: string, profileData: any) {
  const res = await api.put(`/users/${userId}`, profileData);
  return res.data;
}

export async function logout() {
  localStorage.removeItem("currentUser")
}

export async function getActivities() {
  const res = await api.get("/activities");
  return res.data;
}

export async function createActivity(activityData: any) {
  const res = await api.post("/activities", activityData);
  return res.data;
}

export async function joinActivity(activityId: string, userId: string) {
  const res = await api.post(`/activities/${activityId}/join`, { userId });
  return res.data;
}

// 获取活动详情
export async function getActivityById(id: string) {
  const res = await api.get(`/activities/${id}`);
  return res.data;
}

// 更新活动
export async function updateActivity(id: string, activityData: any) {
  const res = await api.put(`/activities/${id}`, activityData);
  return res.data;
}

// 删除活动
export async function deleteActivity(id: string) {
  const res = await api.delete(`/activities/${id}`);
  return res.status === 200;
}

// 审核通过材料
export async function approveActivityMaterials(materialId: string) {
  const res = await api.patch(`/activities/approve/${materialId}`, {
    approvedBy: "系统管理员",
    approvedAt: new Date().toISOString(),
  });
  return res.status === 200;
}

// 驳回材料
export async function rejectActivityMaterials(materialId: string, reason: string) {
  const res = await api.patch(`/activities/reject/${materialId}`, {
    rejectedBy: "系统管理员",
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
  });
  return res.status === 200;
}

// 获取公告列表
export async function getAnnouncements() {
  const res = await api.get("/announcements");
  return res.data; // 假设后端返回 { data: [...] }
}

// 创建公告
export async function createAnnouncement(announcementData: any) {
  const res = await api.post("/announcements", announcementData);
  return res.data; // 返回创建的公告
}

// 更新公告
export async function updateAnnouncement(id: string, announcementData: any) {
  const res = await api.put(`/announcements/${id}`, announcementData);
  return res.data; // 返回更新后的公告
}

// 删除公告
export async function deleteAnnouncement(id: string) {
  const res = await api.delete(`/announcements/${id}`);
  return res.status === 200;
}

// 获取用户参与的所有聊天
export async function getChats(userId: string) {
  const res = await api.get("/chats", { params: { userId } });
  return res.data;
}

// 获取单个聊天详情
export async function getChatById(chatId: string) {
  const res = await api.get(`/chats/${chatId}`);
  return res.data;
}

// 创建新聊天
export async function createChat(chatData: any) {
  const res = await api.post("/chats", chatData);
  return res.data;
}

// 发送新消息
export async function sendMessage(chatId: string, message: any) {
  const res = await api.post(`/chats/${chatId}/messages`, message);
  return res.data;
}

// 获取任务（可选传入 userId 过滤）
export async function getTasks(userId?: string) {
  const res = await api.get("/tasks", {
    params: userId ? { assigneeId: userId } : {},
  });
  return res.data;
}

// 更新任务
export async function updateTask(taskId: string, taskData: any) {
  const res = await api.put(`/tasks/${taskId}`, taskData);
  return res.data;
}

// 获取用户列表（可选 role 筛选）
export async function getUsers(role?: string) {
  const res = await api.get("/users", {
    params: role && role !== "all" ? { role } : {},
  });
  return res.data;
}

// 更新用户角色
export async function updateUserRole(userId: string, newRole: string) {
  const res = await api.put(`/users/${userId}/role`, { role: newRole });
  return res.data;
}

// 更新用户信用分
export async function updateUserCredit(userId: string, newCreditScore: number) {
  const res = await api.put(`/users/${userId}/credit`, { creditScore: newCreditScore });
  return res.data;
}

// 创建新用户
export async function addUser(userData: any) {
  const res = await api.post("/users", userData);
  return res.data;
}

// 批量导入用户（上传文件）
export async function bulkImportUsers(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/users/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
