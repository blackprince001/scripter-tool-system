import { useState } from "react";
import ChannelInput from "../components/channel-input";
import VideoList from "../components/video-list";
import { fetchChannelVideos } from "../api/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Video = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
};

export default function ChannelPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (channelId: string) => {
    setLoading(true);
    setError(null);
    try
    {
      const data = await fetchChannelVideos(channelId);
      setVideos(
        data.videos.map((v: any) => ({
          id: v.video_id,
          title: v.title,
          publishedAt: v.published_at,
          thumbnail: v.thumbnail,
        }))
      );
    } catch (e: any)
    {
      setError(e.message || "Failed to fetch videos");
    } finally
    {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold">YouTube Channel Videos</h2>
        </CardHeader>
        <CardContent>
          <ChannelInput onFetch={handleFetch} />
          {loading && (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && (
            <VideoList videos={videos} onSelect={() => { }} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}