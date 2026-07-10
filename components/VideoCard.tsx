import type { Video } from "@/lib/types";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <a href={`/go/${video.id}`} className="card">
      <div className="thumb">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src.includes("maxresdefault")) {
                img.src = img.src.replace("maxresdefault", "hqdefault");
              } else {
                img.src = "/default-thumbnail.png";
              }
            }}
          />
        ) : (
          <img src="/default-thumbnail.png" alt={video.title} loading="lazy" />
        )}
        <div className="domain-tag">{video.source_domain}</div>
      </div>
      <div className="card-body">
        <div className="card-title">{video.title}</div>
        <div className="card-meta">
          {video.category?.name ?? "Sin categoría"} · {video.clicks} clicks
        </div>
      </div>
    </a>
  );
}
