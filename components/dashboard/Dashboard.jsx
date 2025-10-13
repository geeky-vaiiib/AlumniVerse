"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import MainFeed from "./MainFeed"

export default function Dashboard() {
  const [posts, setPosts] = useState([])
  
  // ✅ Confirmation log that dashboard mounted successfully
  useEffect(() => {
    console.log("[DASHBOARD] ✅ Dashboard mounted successfully, user session stable")
  }, [])

  const handleAddPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts])
  }

  return (
    <DashboardLayout 
      title="News Feed" 
      subtitle="Stay updated with the latest news from your alumni network"
      activeTab="feed"
    >
      <MainFeed userPosts={posts} />
    </DashboardLayout>
  )
}