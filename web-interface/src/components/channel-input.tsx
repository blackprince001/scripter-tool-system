import React, { useState } from "react";

type Props = { onFetch: (channelId: string) => void };

export default function ChannelInput({ onFetch }: Props) {
  const [channelId, setChannelId] = useState("");
  return (
    <div className="flex gap-2 items-center">
      <input
        className="input input-bordered"
        placeholder="YouTube Channel ID"
        value={channelId}
        onChange={e => setChannelId(e.target.value)}
      />
      <button
        className="btn btn-primary"
        onClick={() => onFetch(channelId)}
        disabled={!channelId}
      >
        Fetch Videos
      </button>
    </div>
  );
}