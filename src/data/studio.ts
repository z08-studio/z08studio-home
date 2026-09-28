import type { ImageMetadata } from 'astro';
import newsletterAvatar from '../assets/this-week-in-obsidian.png';

export const studio = {
  name: 'z08 studio',
  title: 'z08 studio — One thing. Done well.',
  description:
    'Small, focused tools by Bear Wang. One tool, one job, done well. Discover Ztab, Zdraft, and This Week in Obsidian.',
  github: 'https://github.com/z08-studio',
  author: {
    name: 'Bear Wang',
    github: 'https://github.com/boundless-forest',
  },
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
      'Keep your tabs in order across Chrome windows. Find the page you need and get back to what you were doing.',
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
    tagline: 'Your thoughts, ready to send.',
    description:
      'Turn rough thoughts into messages you’re ready to send. A focused writing space for drafting, polishing, and translating.',
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
      'Keep up with Obsidian in one weekly read. Useful plugins, practical workflows, and discoveries from the community.',
    href: 'https://thisweekinobsidian.substack.com',
    linkLabel: 'Read the newsletter',
    image: newsletterAvatar,
    background: '#f0f1f3',
    imageWidth: 130,
  },
];
