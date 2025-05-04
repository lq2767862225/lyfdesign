"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send } from "lucide-react"
import { getChats, getChatById, sendMessage, getCurrentUser, getUsers } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function GroupMessagesPage() {
  const { toast } = useToast()
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (user) {
          const chatsData = await getChats(user.id)
          setChats(chatsData)

          if (chatsData.length > 0) {
            const chatData = await getChatById(chatsData[0].id)
            setSelectedChat(chatData)
          }

          const usersData = await getUsers()
          setUsers(usersData)
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
    // 滚动到最新消息
    scrollToBottom()
  }, [selectedChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSelectChat = async (chatId: string) => {
    try {
      const chatData = await getChatById(chatId)
      setSelectedChat(chatData)
    } catch (error) {
      console.error("获取聊天数据失败", error)
      toast({
        title: "获取聊天数据失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !currentUser) return

    try {
      const newMessage = await sendMessage(selectedChat.id, {
        senderId: currentUser.id,
        content: message,
      })

      // 更新聊天消息
      setSelectedChat({
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage],
      })

      // 清空输入框
      setMessage("")

      // 滚动到最新消息
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error("发送消息失败", error)
      toast({
        title: "发送消息失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    }
  }

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId) || { name: "未知用户", avatar: null }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">群组消息</h1>
      <p className="text-muted-foreground">与活动小组成员进行交流</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-240px)]">
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>活动群聊</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto flex-grow">
            <Tabs defaultValue="groups">
              <TabsList className="w-full">
                <TabsTrigger value="groups" className="flex-1">
                  群聊
                </TabsTrigger>
                <TabsTrigger value="direct" className="flex-1">
                  私聊
                </TabsTrigger>
              </TabsList>

              <TabsContent value="groups" className="m-0">
                {chats.filter((chat) => chat.type === "group").length > 0 ? (
                  <div className="divide-y">
                    {chats
                      .filter((chat) => chat.type === "group")
                      .map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-3 cursor-pointer hover:bg-muted ${
                            selectedChat?.id === chat.id ? "bg-muted" : ""
                          }`}
                          onClick={() => handleSelectChat(chat.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{chat.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{chat.participants.length}名成员</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">暂无群聊</div>
                )}
              </TabsContent>

              <TabsContent value="direct" className="m-0">
                <div className="text-center py-8 text-muted-foreground">暂无私聊</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 overflow-hidden flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader className="pb-2 border-b">
                <CardTitle>{selectedChat.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
                <div className="flex-grow overflow-auto p-4 space-y-4">
                  {selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((msg: any) => {
                      const sender = getUserById(msg.senderId)
                      const isCurrentUser = currentUser && msg.senderId === currentUser.id

                      return (
                        <div key={msg.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start max-w-[80%]`}
                          >
                            <Avatar className="mt-1 mx-2">
                              <AvatarImage src={sender.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-1`}>
                                <span className="text-xs text-muted-foreground">
                                  {sender.name} ·{" "}
                                  {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div
                                className={`p-3 rounded-lg ${
                                  isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无消息，发送第一条消息开始聊天吧</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="输入消息..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">选择一个聊天开始交流</div>
          )}
        </Card>
      </div>
    </div>
  )
}
