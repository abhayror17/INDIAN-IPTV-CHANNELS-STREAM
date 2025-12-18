import React, { useState, useEffect } from 'react';
import { Channel, Playlist } from './types';
import { parseM3U, extractGroups } from './utils/m3uParser';
import UploadSection from './components/UploadSection';
import ChannelList from './components/ChannelList';
import VideoPlayer from './components/VideoPlayer';
import { LogOut, Menu, X, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Mobile sidebar toggle
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const processPlaylist = (content: string, filename: string) => {
    try {
        const channels = parseM3U(content);
        const groups = extractGroups(channels);
        
        setPlaylist({
            name: filename,
            channels,
            groups
        });
        
        // Auto-select first channel if available
        // if (channels.length > 0) setSelectedChannel(channels[0]);
    } catch (e) {
        console.error("Failed to parse", e);
        alert("Failed to parse playlist. Please ensure it is a valid M3U file.");
    }
  };

  const handleUpload = async (content: string, filename: string) => {
    setIsLoading(true);
    // Wrap in timeout to allow UI to update to loading state for large files
    setTimeout(() => {
        processPlaylist(content, filename);
        setIsLoading(false);
    }, 100);
  };

  const handleReset = () => {
    setPlaylist(null);
    setSelectedChannel(null);
  };

  // Auto-load default playlists
  useEffect(() => {
    const loadDefaults = async () => {
        try {
            const urls = [
                'https://raw.githubusercontent.com/FunctionError/PiratesTv/main/combined_playlist.m3u',
                'https://iptv-org.github.io/iptv/countries/in.m3u'
            ];
            
            const responses = await Promise.all(urls.map(u => fetch(u)));
            const texts = await Promise.all(responses.map(r => r.text()));
            const combined = texts.join('\n');
            
            processPlaylist(combined, 'Featured Channels');
        } catch (e) {
            console.error("Failed to auto-load defaults", e);
            // Fallback to upload screen if defaults fail
        } finally {
            setIsInitialLoad(false);
        }
    };
    
    loadDefaults();
  }, []);

  if (isInitialLoad) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="animate-pulse">Loading channels...</p>
        </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <UploadSection onUpload={handleUpload} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-30 h-full w-80 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 h-16 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="font-bold text-white text-lg">S</span>
             </div>
             <div className="min-w-0">
                <h1 className="font-bold text-white truncate text-sm">StreamFlow</h1>
                <p className="text-xs text-slate-500 truncate">{playlist.name}</p>
             </div>
          </div>
          <button 
             onClick={() => setIsSidebarOpen(false)} 
             className="md:hidden p-1 text-slate-400 hover:text-white"
          >
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0">
            <ChannelList 
                channels={playlist.channels} 
                groups={playlist.groups}
                selectedChannelId={selectedChannel?.id || null}
                onSelectChannel={(c) => {
                    setSelectedChannel(c);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
            />
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
            <button 
                onClick={handleReset}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
            >
                <LogOut className="w-4 h-4" />
                Upload New Playlist
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 shrink-0">
             <button onClick={toggleSidebar} className="text-slate-300 mr-3">
                 <Menu className="w-6 h-6" />
             </button>
             <span className="font-semibold text-white truncate">
                 {selectedChannel ? selectedChannel.name : 'Select a Channel'}
             </span>
        </div>

        <div className="flex-1 relative">
            <VideoPlayer 
                src={selectedChannel?.url || null} 
                poster={selectedChannel?.logo}
            />
            
            {selectedChannel && (
                 <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">{selectedChannel.name}</h2>
                    <p className="text-slate-300 text-sm drop-shadow-md">{selectedChannel.group}</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;