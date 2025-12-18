export interface Channel {
  id: string;
  name: string;
  url: string;
  group: string;
  logo?: string;
  tvgId?: string;
}

export interface Playlist {
  name: string;
  channels: Channel[];
  groups: string[];
}

export type SortOption = 'name' | 'group';

export interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}
