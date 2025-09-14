"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Play, Loader2, CheckCircle, XCircle, FileText } from "lucide-react"
import { ProcessingStatus } from "../api/api"

type Video = {
  id: string
  title: string
  publishedAt: string
  thumbnail: string
  duration?: string
  viewCount?: string
}

type Props = {
  video: Video
  processingStatus?: ProcessingStatus
  category?: string
  errorMessage?: string
  onProcess: (videoId: string) => void
  onViewTranscript?: (videoId: string) => void
  isProcessing?: boolean
}

const statusConfig = {
  pending: {
    icon: FileText,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    label: "Not Processed"
  },
  processing: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    label: "Processing..."
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
    label: "Completed"
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-100",
    label: "Failed"
  }
}

export default function EnhancedVideoCard({
  video,
  processingStatus = "pending",
  category,
  errorMessage,
  onProcess,
  onViewTranscript,
  isProcessing = false
}: Props) {
  const config = statusConfig[processingStatus]
  const StatusIcon = config.icon

  return (
    <Card className="card-interactive hover-lift overflow-hidden">
      <div className="relative">
        <img
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
          <Play className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
        {video.duration && (
          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
            {video.duration}
          </Badge>
        )}
        <Badge className={`absolute top-2 left-2 ${config.bgColor} ${config.color} border-0`}>
          <StatusIcon className={`h-3 w-3 mr-1 ${processingStatus === 'processing' ? 'animate-spin' : ''}`} />
          {config.label}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(video.publishedAt).toLocaleDateString()}
          </div>
          {video.viewCount && <span>{video.viewCount} views</span>}
        </div>

        {category && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-2">
          {processingStatus === "pending" && (
            <Button
              size="sm"
              onClick={() => onProcess(video.id)}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-3 w-3 mr-1" />
                  Process
                </>
              )}
            </Button>
          )}

          {processingStatus === "completed" && onViewTranscript && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewTranscript(video.id)}
              className="flex-1"
            >
              <FileText className="h-3 w-3 mr-1" />
              View Transcript
            </Button>
          )}

          {processingStatus === "failed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onProcess(video.id)}
              disabled={isProcessing}
              className="flex-1"
            >
              <FileText className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
