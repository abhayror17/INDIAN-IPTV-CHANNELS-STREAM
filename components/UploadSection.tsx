import React, { useState } from 'react';
import { Upload, Link as LinkIcon, FileText, AlertTriangle, Tv, PlayCircle, Globe } from 'lucide-react';

interface UploadSectionProps {
  onUpload: (content: string, filename: string) => void;
  isLoading: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onUpload, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onUpload(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    loadUrl(url, 'URL Playlist');
  };

  const loadUrl = async (playlistUrl: string, name: string) => {
    setError(null);
    try {
      const response = await fetch(playlistUrl);
      if (!response.ok) throw new Error('Failed to fetch playlist');
      const text = await response.text();
      onUpload(text, name);
    } catch (err) {
        console.error(err);
        setError(`Failed to load URL. ${err instanceof Error ? err.message : ''}`);
    }
  };

  const handleLoadDefaults = async () => {
     setError(null);
     try {
        const urls = [
          'https://raw.githubusercontent.com/FunctionError/PiratesTv/main/combined_playlist.m3u',
          'https://iptv-org.github.io/iptv/countries/in.m3u'
        ];
        
        // This button will replicate the auto-load behavior
        const responses = await Promise.all(urls.map(u => fetch(u)));
        const texts = await Promise.all(responses.map(r => r.text()));
        const combined = texts.join('\n');
        onUpload(combined, 'Featured Channels');
     } catch (err) {
         setError("Failed to load featured playlists.");
     }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">StreamFlow</h1>
            <p className="text-slate-400">Upload your M3U playlist to start watching</p>
        </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 backdrop-blur-sm">
        
        {/* Featured / Quick Load */}
        <div className="mb-6">
            <button 
                onClick={handleLoadDefaults}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    'Loading Channels...'
                ) : (
                    <>
                        <Globe className="w-5 h-5" />
                        Load Featured Channels (India + PiratesTV)
                    </>
                )}
            </button>
            <p className="text-xs text-center text-slate-500 mt-2">
                Includes thousands of free live TV channels
            </p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-700 flex-1"></div>
          <span className="text-xs text-slate-500 uppercase font-bold">Or Upload</span>
          <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Upload M3U/M3U8 File
          </label>
          <div className="relative group">
            <input
              type="file"
              accept=".m3u,.m3u8"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isLoading}
            />
            <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 group-hover:border-blue-500 transition-all">
              <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-blue-400" />
              <span className="text-sm text-slate-400 group-hover:text-slate-200">
                Browse or drag file
              </span>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <form onSubmit={handleUrlSubmit}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Paste Playlist URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/playlist.m3u"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!url || isLoading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load
            </button>
          </div>
        </form>

        {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
            </div>
        )}
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-slate-800/30">
            <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <h3 className="text-slate-200 font-medium text-sm">M3U Support</h3>
            <p className="text-xs text-slate-500 mt-1">Full support for extended M3U files</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/30">
            <Tv className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <h3 className="text-slate-200 font-medium text-sm">Channel Search</h3>
            <p className="text-xs text-slate-500 mt-1">Instantly find your favorite channels</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-800/30">
            <PlayCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <h3 className="text-slate-200 font-medium text-sm">HLS Streaming</h3>
            <p className="text-xs text-slate-500 mt-1">Smooth playback with HLS support</p>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;