import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Play, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string | null;
  poster?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hlsRef = useRef<any>(null); // Store HLS instance

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state when src changes
    setError(null);
    if (!src) return;

    setIsLoading(true);

    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e: Event) => {
        setIsLoading(false);
        const target = e.target as HTMLVideoElement;
        console.error("Video Error:", target.error);
        setError(`Playback Error: ${target.error?.message || 'Unknown error'}`);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // HLS.js implementation
    if ((window as any).Hls && (window as any).Hls.isSupported() && src.includes('.m3u8')) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new (window as any).Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(e => {
            console.warn("Autoplay prevented:", e);
             // Often due to browser policy if not muted, usually handled by UI overlay
          });
        }
      });

      hls.on((window as any).Hls.Events.ERROR, (_event: any, data: any) => {
        if (data.fatal) {
           setIsLoading(false);
           setError(`Stream Error: ${data.details}`);
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
      if (autoPlay) {
         video.addEventListener('loadedmetadata', () => {
            video.play().catch(console.warn);
         });
      }
    } else {
      // Direct file play (mp4, etc)
      video.src = src;
      if (autoPlay) {
         video.play().catch(console.warn);
      }
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, autoPlay]);

  if (!src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 text-slate-400 rounded-lg border-2 border-dashed border-slate-700">
        <Play className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Select a channel to start watching</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl group">
        
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      )}
      
      {error && (
         <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-400 font-medium">{error}</p>
            <button 
                onClick={() => { if(videoRef.current) videoRef.current.load(); setError(null); }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-white transition-colors"
            >
                Retry
            </button>
         </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        poster={poster}
        playsInline
      />
    </div>
  );
};

export default VideoPlayer;