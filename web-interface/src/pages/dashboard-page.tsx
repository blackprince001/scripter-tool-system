"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3,
  FileText,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Sparkles
} from "lucide-react"
import { fetchCategories } from "../api/api"
import { Link } from "react-router-dom"

type DashboardStats = {
  totalVideos: number
  processedVideos: number
  categories: number
  recentActivity: Array<{
    id: string
    type: 'video_processed' | 'category_created' | 'story_generated'
    title: string
    timestamp: string
    status: 'success' | 'error'
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    processedVideos: 0,
    categories: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try
    {
      // Load categories
      const categoriesData = await fetchCategories()
      setCategories(categoriesData.map(c => c.name))

      // Load recent activity from localStorage (in a real app, this would come from an API)
      const recentActivity = JSON.parse(localStorage.getItem('recentActivity') || '[]')

      setStats({
        totalVideos: parseInt(localStorage.getItem('totalVideos') || '0'),
        processedVideos: parseInt(localStorage.getItem('processedVideos') || '0'),
        categories: categoriesData.length,
        recentActivity
      })
    } catch (error)
    {
      console.error('Failed to load dashboard data:', error)
    } finally
    {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type)
    {
      case 'video_processed': return <FileText className="h-4 w-4" />
      case 'category_created': return <BookOpen className="h-4 w-4" />
      case 'story_generated': return <Sparkles className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    return status === 'success' ? 'text-green-500' : 'text-red-500'
  }

  if (loading)
  {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Overview of your content processing activity</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              Videos from all channels
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Videos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.processedVideos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVideos > 0 ? Math.round((stats.processedVideos / stats.totalVideos) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              Auto-generated categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex flex-col gap-2">
              <Link to="/">
                <Play className="h-6 w-6" />
                <span>Process Channel</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
              <Link to="/transcripts">
                <FileText className="h-6 w-6" />
                <span>View Transcripts</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
              <Link to="/stories">
                <Sparkles className="h-6 w-6" />
                <span>Generate Stories</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Overview */}
      {categories.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={getActivityColor(activity.status)}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Start processing videos to see activity here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
