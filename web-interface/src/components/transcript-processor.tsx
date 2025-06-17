import React, { useState } from "react";

type Props = {
  onProcess: (url: string, category?: string, autoCategorize?: boolean) => void;
  categories: string[];
};

export default function TranscriptProcessor({ onProcess, categories }: Props) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [autoCategorize, setAutoCategorize] = useState(true);

  return (
    <div className="flex flex-col gap-2">
      <input
        className="input input-bordered"
        placeholder="YouTube Video URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <div className="flex gap-2 items-center">
        <select
          className="select"
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={autoCategorize}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={autoCategorize}
            onChange={e => setAutoCategorize(e.target.checked)}
          />
          Auto Categorize
        </label>
        <button
          className="btn btn-primary"
          onClick={() => onProcess(url, category, autoCategorize)}
          disabled={!url}
        >
          Process Transcript
        </button>
      </div>
    </div>
  );
}