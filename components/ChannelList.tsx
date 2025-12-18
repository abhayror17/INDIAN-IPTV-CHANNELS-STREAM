import React, { useMemo, useState } from 'react';
import { Search, Tv, Filter, PlayCircle } from 'lucide-react';
import { Channel } from '../types';

interface ChannelListProps {
  channels: Channel[];
  groups: string[];
  selectedChannelId: string | null;
  onSelectChannel: (channel: Channel) => void;
}

const ITEMS_PER_PAGE = 50;

const ChannelList: React.FC<ChannelListProps> = ({ 
  channels, 
  groups, 
  selectedChannelId, 
  onSelectChannel 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);

  // Filter channels based on search and group
  const filteredChannels = useMemo(() => {
    let result = channels;

    if (selectedGroup !== 'All') {
      result = result.filter(c => c.group === selectedGroup);
    }

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lowerTerm)
      );
    }

    return result;
  }, [channels, selectedGroup, searchTerm]);

  // Handle visible items for "infinite scroll" simulation
  const visibleChannels = filteredChannels.slice(0, displayLimit);

  const handleShowMore = () => {
    setDisplayLimit(prev => prev + ITEMS_PER_PAGE);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setDisplayLimit(ITEMS_PER_PAGE); // Reset pagination on search
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(e.target.value);
    setDisplayLimit(ITEMS_PER_PAGE); // Reset pagination on filter
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Header & Filters */}
      <div className="p-4 space-y-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Tv className="w-4 h-4" /> 
            Channels ({filteredChannels.length})
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
                value={selectedGroup}
                onChange={handleGroupChange}
                className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg pl-9 pr-8 py-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
                <option value="All">All Groups</option>
                {groups.map(group => (
                    <option key={group} value={group}>{group}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {visibleChannels.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No channels found</p>
          </div>
        ) : (
          <>
            {visibleChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 group ${
                  selectedChannelId === channel.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 overflow-hidden ${selectedChannelId === channel.id ? 'bg-blue-500' : 'bg-slate-800'}`}>
                    {channel.logo ? (
                        <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                        <Tv className={`w-5 h-5 ${selectedChannelId === channel.id ? 'text-blue-100' : 'text-slate-500'}`} />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{channel.name}</p>
                    <p className={`text-xs truncate ${selectedChannelId === channel.id ? 'text-blue-200' : 'text-slate-500'}`}>
                        {channel.group}
                    </p>
                </div>
                {selectedChannelId === channel.id && <PlayCircle className="w-5 h-5 text-blue-200" />}
              </button>
            ))}
            
            {visibleChannels.length < filteredChannels.length && (
              <button
                onClick={handleShowMore}
                className="w-full py-3 text-sm text-blue-400 hover:text-blue-300 font-medium hover:bg-slate-800/50 rounded transition-colors"
              >
                Load More Channels...
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChannelList;