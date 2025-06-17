/// <reference types="vite/client" />
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export type Video = {
  video_id: string;
  title: string;
  published_at: string;
  thumbnail: string;
};

export type ChannelVideosResponse = {
  channel_id: string;
  total_videos: number;
  videos: Video[];
};

export type Category = {
  name: string;
};

export type Transcript = {
  _id: string;
  video_id: string;
  title: string;
  transcript: string;
  category: string;
  sanitized_category: string;
  created_at: string;
  metadata?: Record<string, any>;
};

export type TranscriptProcessResponse = {
  status: string;
  video_id: string;
  category: string;
  auto_generated: boolean;
};

export type CategoryWeight = {
  name: string;
  weight: number;
};

export type GeneratedStoryResponse = {
  variations: string[];
  created_at?: string;
};

export type Story = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
};

export async function fetchChannelVideos(channelId: string, maxResults = 20, order = "date"): Promise<ChannelVideosResponse> {
  const res = await fetch(`${API_BASE}/youtube/channel/${channelId}/videos?max_results=${maxResults}&order=${order}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories/`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function processTranscript(url: string, category?: string, autoCategorize = true): Promise<TranscriptProcessResponse> {
  const params = new URLSearchParams({ url, auto_categorize: String(autoCategorize) });
  if (category) params.append("category", category);
  const res = await fetch(`${API_BASE}/transcripts/process`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTranscript(videoId: string, category?: string): Promise<Transcript> {
  const url = category
    ? `${API_BASE}/transcripts/${videoId}?category=${encodeURIComponent(category)}`
    : `${API_BASE}/transcripts/${videoId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTranscriptsByCategory(category: string, limit = 20): Promise<{ category: string; total_transcripts: number; material: string[]; video_ids: string[] }> {
  const res = await fetch(`${API_BASE}/transcripts/by-category/${encodeURIComponent(category)}?limit=${limit}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTranscript(videoId: string, category: string): Promise<void> {
  const url = `${API_BASE}/transcripts/${videoId}?category=${encodeURIComponent(category)}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export async function generateStory(data: {
  category_weights: CategoryWeight[];
  variations_count: number;
  style: string;
  material_per_category: number;
  length: number;
}): Promise<GeneratedStoryResponse> {
  const res = await fetch(`${API_BASE}/generate/story`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateStoryFromTranscripts(data: {
  transcript_ids: string[];
  variations_count: number;
  style: string;
  length: number;
}): Promise<GeneratedStoryResponse> {
  const res = await fetch(`${API_BASE}/generate/story-from-transcripts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateStoryFromSynopsis(data: {
  story: string;
  variations_count: number;
  style: string;
  length: number;
}): Promise<GeneratedStoryResponse> {
  const res = await fetch(`${API_BASE}/generate/story-from-synopsis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export async function fetchStory(storyId: string): Promise<Story> {
  const res = await fetch(`${API_BASE}/stories/${storyId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteStory(storyId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/stories/${storyId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export async function createStory(data: { title: string; content: string }): Promise<Story> {
  const res = await fetch(`${API_BASE}/stories/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateStory(storyId: string, data: { title?: string; content?: string }): Promise<Story> {
  const res = await fetch(`${API_BASE}/stories/${storyId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
