import { Channel } from '../types';

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Parse EXTINF line
      // Format: #EXTINF:duration attributes,Channel Name
      const infoMatch = line.match(/#EXTINF:(-?\d+)(?:\s+(.*))?,(.*)/);
      
      if (infoMatch) {
        const attributesRaw = infoMatch[2] || '';
        const name = infoMatch[3].trim();
        
        currentChannel = {
          id: crypto.randomUUID(),
          name: name || 'Unknown Channel',
          group: 'Uncategorized', // Default group
        };

        // Extract attributes
        const tvgLogoMatch = attributesRaw.match(/tvg-logo="([^"]*)"/);
        if (tvgLogoMatch) currentChannel.logo = tvgLogoMatch[1];

        const groupTitleMatch = attributesRaw.match(/group-title="([^"]*)"/);
        if (groupTitleMatch) currentChannel.group = groupTitleMatch[1];

        const tvgIdMatch = attributesRaw.match(/tvg-id="([^"]*)"/);
        if (tvgIdMatch) currentChannel.tvgId = tvgIdMatch[1];
      }
    } else if (line.startsWith('http') || line.startsWith('rtmp') || (line.length > 0 && !line.startsWith('#'))) {
      // Line is a URL
      if (currentChannel.id) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = {}; // Reset
      }
    }
  }

  return channels;
};

export const extractGroups = (channels: Channel[]): string[] => {
  const groups = new Set(channels.map(c => c.group));
  return Array.from(groups).sort();
};