import React from "react";

type Props = {
  stories: string[];
};

export default function StoryVariations({ stories }: Props) {
  return (
    <div className="mt-4">
      {stories.map((story, idx) => (
        <div key={idx} className="border rounded p-2 mb-2">
          <div className="font-bold">Variation {idx + 1}</div>
          <div className="whitespace-pre-line">{story}</div>
        </div>
      ))}
    </div>
  );
}