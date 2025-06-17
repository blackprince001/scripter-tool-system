import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube } from 'lucide-react';

type Props = {
  onFetch: (channelId: string) => void;
  isLoading?: boolean;
};

export default function ChannelInput({ onFetch, isLoading = false }: Props) {
  const [channelId, setChannelId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelId.trim())
    {
      onFetch(channelId.trim());
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Channel Videos
        </CardTitle>
        <CardDescription>
          Enter a YouTube channel ID to fetch all videos from that channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-id">YouTube Channel ID</Label>
            <Input
              id="channel-id"
              placeholder="e.g., UCBJycsmduvYEL83R_U4JriQ"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="focus-ring"
            />
          </div>
          <Button
            type="submit"
            disabled={!channelId.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? "Fetching Videos..." : "Fetch Videos"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
