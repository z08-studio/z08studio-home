import type { ImageMetadata } from 'astro';
import newsletterAvatar from '../assets/this-week-in-obsidian.png';

export const studio = {
  name: 'z08 studio',
  title: 'z08 studio — Good tools. Better days.',
  description:
    'An independent studio making thoughtful tools and sharing useful ideas for the way you browse, write, and think. Discover Ztab, Zdraft, and This Week in Obsidian.',
  github: 'https://github.com/z08-studio',
};

export interface Project {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  href: `https://${string}`;
  linkLabel: string;
  image: string | ImageMetadata;
  background: string;
  imageWidth: number;
}

// Order here is the order on the homepage. Add one object to add a project.
export const projects: Project[] = [
  {
    id: 'ztab',
    name: 'Ztab',
    category: 'Chrome extension',
    tagline: 'A home for every tab.',
    description:
      'Bring your Chrome windows together. Organize open tabs, keep your favorites close, and pick up where you left off.',
    href: 'https://chromewebstore.google.com/detail/fakbifeeblnopdhicpmhhmcdhmefphjp',
    linkLabel: 'Meet Ztab',
    image: '/images/ztab.svg',
    background: '#f0edf6',
    imageWidth: 148,
  },
  {
    id: 'zdraft',
    name: 'Zdraft',
    category: 'Mac app',
    tagline: 'From a thought to the right words.',
    description:
      'A quiet place for your next draft. Write, polish, and translate your thoughts into messages that are ready to send.',
    href: 'https://zdraft.app',
    linkLabel: 'Meet Zdraft',
    image: '/images/zdraft.svg',
    background: '#eaf0f8',
    imageWidth: 130,
  },
  {
    id: 'this-week-in-obsidian',
    name: 'This Week in Obsidian',
    category: 'Weekly newsletter',
    tagline: 'A little discovery, every Tuesday.',
    description:
      'The latest from the Obsidian community. Discover useful plugins, thoughtful workflows, and ideas worth keeping.',
    href: 'https://thisweekinobsidian.substack.com',
    linkLabel: 'Read the newsletter',
    image: newsletterAvatar,
    background: '#f0f1f3',
    imageWidth: 210,
  },
];
