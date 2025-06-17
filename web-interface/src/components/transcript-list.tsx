import React from "react";

type Transcript = {
  id: string;
  title: string;
  category: string;
  preview: string;
};

type Props = {
  transcripts: Transcript[];
  onSelect: (id: string) => void;
};

export default function TranscriptList({ transcripts, onSelect }: Props) {
  return (
    <div className="mt-4">
      {transcripts.map(t => (
        <div
          key={t.id}
          className="border-b py-2 cursor-pointer hover:bg-gray-50"
          onClick={() => onSelect(t.id)}
        >
          <div className="font-semibold">{t.title}</div>
          <div className="text-xs text-gray-500">{t.category}</div>
          <div className="text-sm truncate">{t.preview}</div>
        </div>
      ))}
    </div>
  );
}