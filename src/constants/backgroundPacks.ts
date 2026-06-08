import type { FormatKey } from '@/constants/formats';

export interface BackgroundPack {
  id: string;
  name: string;
  formats: Record<FormatKey, string>;
}

export const DEFAULT_BACKGROUND_PACK_ID = 'paper';

export const BACKGROUND_PACKS: BackgroundPack[] = [
  {
    id: 'paper',
    name: 'Paper',
    formats: {
      square: '/backgrounds/paper/square_1080x1080.jpg',
      portrait: '/backgrounds/paper/portrait_1080x1350.jpg',
      story: '/backgrounds/paper/story_1080x1920.jpg',
      linkedin: '/backgrounds/paper/linkedin_1200x627.jpg',
    },
  },
  {
    id: 'demo',
    name: 'Demo',
    formats: {
      square: '/backgrounds/demo/square_1080x1080.jpg',
      portrait: '/backgrounds/demo/portrait_1080x1350.jpg',
      story: '/backgrounds/demo/story_1080x1920.jpg',
      linkedin: '/backgrounds/demo/linkedin_1200x627.jpg',
    },
  },
];

export function getBackgroundPack(id: string): BackgroundPack | undefined {
  return BACKGROUND_PACKS.find((pack) => pack.id === id);
}

export function getBackgroundPackList(): BackgroundPack[] {
  return BACKGROUND_PACKS;
}
