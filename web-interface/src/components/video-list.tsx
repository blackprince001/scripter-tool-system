type Video = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
};

type Props = {
  videos: Video[];
  onSelect: (videoId: string) => void;
};

export default function VideoList({ videos, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {videos.map(video => (
        <div
          key={video.id}
          className="border rounded p-2 cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect(video.id)}
        >
          <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover" />
          <div className="font-bold">{video.title}</div>
          <div className="text-xs text-gray-500">{video.publishedAt}</div>
        </div>
      ))}
    </div>
  );
}