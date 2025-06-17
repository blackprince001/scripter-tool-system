import { useState, useEffect } from "react";
import TranscriptProcessor from "../components/transcript-processor";
import TranscriptList from "../components/transcript-list";
import { fetchCategories, processTranscript, fetchTranscriptsByCategory } from "../api/api";

export default function TranscriptsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(cats => setCategories(cats.map(c => c.name)));
  }, []);

  useEffect(() => {
    if (selectedCategory)
    {
      fetchTranscriptsByCategory(selectedCategory).then(data => {
        setTranscripts(
          data.material.map((text, idx) => ({
            id: data.video_ids[idx],
            title: `Transcript ${idx + 1}`,
            category: data.category,
            preview: text.slice(0, 100) + "...",
          }))
        );
      });
    }
  }, [selectedCategory]);

  const handleProcess = async (url: string, category?: string, autoCategorize?: boolean) => {
    await processTranscript(url, category, autoCategorize);
    if (category) setSelectedCategory(category);
  };

  return (
    <div>
      <TranscriptProcessor onProcess={handleProcess} categories={categories} />
      {/* Optionally add a category selector here */}
      <TranscriptList transcripts={transcripts} onSelect={() => { }} />
    </div>
  );
}