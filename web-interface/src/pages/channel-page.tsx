"use client"

import { useState, useCallback } from "react"
import ChannelInput from "../components/channel-input"
import EnhancedVideoCard from "../components/enhanced-video-card"
import { fetchChannelVideos, batchProcessTranscripts, getBatchStatus, type VideoProcessingItem, type ProcessingStatus } from "../api/api"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Video, AlertCircle, Play, Loader2 } from "lucide-react"
import { StorageManager } from '../utils/storage'

type VideoType = {
  id: string
  title: string
  publishedAt: string
  thumbnail: string
}

type VideoWithStatus = VideoType & {
  processingStatus: ProcessingStatus
  category?: string
  errorMessage?: string
}

export default function EnhancedChannelPage() {
  const [videos, setVideos] = useState<VideoWithStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [batchId, setBatchId] = useState<string | null>(null)
  const [batchProcessing, setBatchProcessing] = useState(false)
  // const [processingStats, setProcessingStats] = useState({
  //   total: 0,
  //   completed: 0,
  //   failed: 0,
  //   pending: 0
  // })

  const loadCachedData = (channelId: string) => {
    const cached = StorageManager.getChannelData(channelId)
    if (cached)
    {
      setVideos(cached.videos)
      // updateProcessingStats(cached.videos)bru
    }
  }

  const saveToCache = (channelId: string, videos: VideoWithStatus[]) => {
    StorageManager.setChannelData(channelId, { videos })
  }

  // const updateProcessingStats = (videos: VideoWithStatus[]) => {
  //   const stats = videos.reduce((acc, video) => {
  //     acc[video.processingStatus]++
  //     return acc
  //   }, { completed: 0, failed: 0, pending: 0, processing: 0 })

  //   // setProcessingStats({
  //   //   total: videos.length,
  //   //   completed: stats.completed,
  //   //   failed: stats.failed,
  //   //   pending: stats.pending
  //   // })
  // }

  const handleFetch = async (channelId: string) => {
    // Try to load from cache first
    loadCachedData(channelId)

    setLoading(true)
    setError(null)
    try
    {
      const data = await fetchChannelVideos(channelId)
      const videosWithStatus = data.videos.map((v: any) => ({
        id: v.video_id,
        title: v.title,
        publishedAt: v.published_at,
        thumbnail: v.thumbnail,
        processingStatus: "pending" as ProcessingStatus,
        category: undefined,
        errorMessage: undefined
      }))
      setVideos(videosWithStatus)
      // updateProcessingStats(videosWithStatus)

      // Save to cache
      saveToCache(channelId, videosWithStatus)

      // Update stats
      StorageManager.updateStats({ totalVideos: videosWithStatus.length })
    } catch (e: any)
    {
      setError(e.message || "Failed to fetch videos")
    } finally
    {
      setLoading(false)
    }
  }

  const handleProcessVideo = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId)
    if (!video) return

    // Update video status to processing
    setVideos(prev => prev.map(v =>
      v.id === videoId
        ? { ...v, processingStatus: "processing" as ProcessingStatus }
        : v
    ))
    // updateProcessingStats(videos.map(v =>
    //   v.id === videoId
    //     ? { ...v, processingStatus: "processing" as ProcessingStatus }
    //     : v
    // ))

    try
    {
      const response = await fetch('/api/transcripts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          auto_categorize: 'true'
        })
      })

      if (response.ok)
      {
        const result = await response.json()
        const updatedVideos = videos.map(v =>
          v.id === videoId
            ? {
              ...v,
              processingStatus: "completed" as ProcessingStatus,
              category: result.category
            }
            : v
        )
        setVideos(updatedVideos)
        // updateProcessingStats(updatedVideos)

        // Add activity
        StorageManager.addActivity({
          type: 'video_processed',
          title: `Processed: ${video.title}`,
          status: 'success'
        })

        // Update processed count
        const currentProcessed = Number(StorageManager.getItem('processedVideos') || 0)
        StorageManager.updateStats({ processedVideos: currentProcessed + 1 })
      } else
      {
        throw new Error('Processing failed')
      }
    } catch (error)
    {
      const updatedVideos = videos.map(v =>
        v.id === videoId
          ? {
            ...v,
            processingStatus: "failed" as ProcessingStatus,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
          : v
      )
      setVideos(updatedVideos)
      // updateProcessingStats(updatedVideos)

      // Add failed activity
      StorageManager.addActivity({
        type: 'video_processed',
        title: `Failed: ${video.title}`,
        status: 'error'
      })
    }
  }

  const handleBatchProcess = async () => {
    const pendingVideos = videos.filter(v => v.processingStatus === "pending")
    if (pendingVideos.length === 0) return

    setBatchProcessing(true)
    try
    {
      const videoItems: VideoProcessingItem[] = pendingVideos.map(video => ({
        video_id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        status: "pending" as ProcessingStatus
      }))

      const response = await batchProcessTranscripts({
        videos: videoItems,
        auto_categorize: true
      })

      setBatchId(response.batch_id)

      // Start polling for status updates
      pollBatchStatus(response.batch_id)
    } catch (error)
    {
      console.error('Batch processing failed:', error)
      setError(error instanceof Error ? error.message : 'Batch processing failed')
    } finally
    {
      setBatchProcessing(false)
    }
  }

  const pollBatchStatus = useCallback(async (batchId: string) => {
    const poll = async () => {
      try
      {
        const status = await getBatchStatus(batchId)

        // Update videos with new status
        const updatedVideos = videos.map(video => {
          const videoStatus = status.videos.find(v => v.video_id === video.id)
          if (videoStatus)
          {
            return {
              ...video,
              processingStatus: videoStatus.status,
              category: videoStatus.category,
              errorMessage: videoStatus.error_message
            }
          }
          return video
        })

        setVideos(updatedVideos)
        // updateProcessingStats(updatedVideos)

        // Continue polling if not completed
        if (status.status === "processing")
        {
          setTimeout(poll, 2000) // Poll every 2 seconds
        } else
        {
          // Batch completed, update stats
          const completedCount = updatedVideos.filter(v => v.processingStatus === "completed").length
          const currentProcessed = typeof StorageManager.getItem('processedVideos') === 'number'
            ? StorageManager.getItem('processedVideos') as number
            : 0
          StorageManager.updateStats({ processedVideos: currentProcessed + completedCount })

          // Add batch completion activity
          StorageManager.addActivity({
            type: 'video_processed',
            title: `Batch completed: ${completedCount} videos processed`,
            status: 'success'
          })
        }
      } catch (error)
      {
        console.error('Failed to get batch status:', error)
      }
    }

    poll()
  }, [videos])

  const handleViewTranscript = (videoId: string) => {
    // Navigate to transcript view or open modal
    console.log('View transcript for:', videoId)
  }

  const pendingCount = videos.filter(v => v.processingStatus === "pending").length
  const completedCount = videos.filter(v => v.processingStatus === "completed").length
  const failedCount = videos.filter(v => v.processingStatus === "failed").length
  const processingCount = videos.filter(v => v.processingStatus === "processing").length

  return (
    <div className="space-y-sections">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Video className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold">Channel Processing Hub</h1>
        </div>
        <p className="text-muted-foreground">Fetch videos and process transcripts in batch</p>
      </div>

      {/* Channel Input */}
      <ChannelInput onFetch={handleFetch} isLoading={loading} />

      {/* Processing Stats */}
      {videos.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Processing Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{processingCount}</div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{failedCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleBatchProcess}
                  disabled={batchProcessing}
                  className="flex-1"
                >
                  {batchProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing All...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Process All Pending ({pendingCount})
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Batch Status */}
            {batchId && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  <span className="text-sm font-medium text-blue-700">
                    Batch processing in progress... (ID: {batchId.slice(0, 8)}...)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Loading Videos...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="border border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Videos List */}
      {!loading && !error && videos.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Found {videos.length} videos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <EnhancedVideoCard
                key={video.id}
                video={video}
                processingStatus={video.processingStatus}
                category={video.category}
                errorMessage={video.errorMessage}
                onProcess={handleProcessVideo}
                onViewTranscript={handleViewTranscript}
                isProcessing={batchProcessing}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && videos.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">Enter a YouTube channel ID above to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}