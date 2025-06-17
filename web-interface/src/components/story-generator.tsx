import React, { useState } from "react";

type CategoryWeight = { name: string; weight: number };

type Props = {
  categories: string[];
  onGenerate: (weights: CategoryWeight[], style: string, length: number) => void;
};

export default function StoryGenerator({ categories, onGenerate }: Props) {
  const [weights, setWeights] = useState<CategoryWeight[]>([]);
  const [style, setStyle] = useState("professional");
  const [length, setLength] = useState(500);

  // UI for selecting categories and weights omitted for brevity

  return (
    <div className="flex flex-col gap-2">
      {/* Category weights UI */}
      <button
        className="btn btn-primary"
        onClick={() => onGenerate(weights, style, length)}
      >
        Generate Story
      </button>
    </div>
  );
}