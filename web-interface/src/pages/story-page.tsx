import { useState, useEffect } from "react";
import StoryGenerator from "../components/story-generator";
import StoryVariations from "../components/story-variations";
import { fetchCategories, generateStory, type CategoryWeight } from "../api/api";

export default function StoryPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [stories, setStories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories().then(cats => setCategories(cats.map(c => c.name)));
  }, []);

  const handleGenerate = async (weights: CategoryWeight[], style: string, length: number) => {
    const res = await generateStory({
      category_weights: weights,
      variations_count: 3,
      style,
      material_per_category: 1,
      length,
    });
    setStories(res.variations);
  };

  return (
    <div>
      <StoryGenerator categories={categories} onGenerate={handleGenerate} />
      <StoryVariations stories={stories} />
    </div>
  );
}