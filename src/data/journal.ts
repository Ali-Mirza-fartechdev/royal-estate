// SAMPLE ARTICLES — placeholder editorial content; seeds the demo / "Import sample content".
import { img } from './images'
import type { Article } from '../cms/types'

export type SeedArticle = Omit<Article, 'id' | 'published' | 'sort' | 'updatedAt'>

export const seedArticles: SeedArticle[] = [
  {
    slug: 'reading-a-house-by-its-light',
    title: 'Reading a house by its light',
    category: 'Architecture',
    date: '2026-09-12',
    read: '5 min',
    excerpt: 'How to judge a residence by the way daylight moves through it, long before you count the rooms.',
    image: img.glass,
    body: [
      'The most revealing hour of a visit is rarely the one on the schedule. Arrive early, stay late, and watch where the light lands.',
      'Deep overhangs, material choices and window orientation all shape how a house feels at different hours. A well-considered plan gives each room a different quality of light.',
      'Ask for a second viewing at a different time of day. The house you remember should be the one you live in.',
    ],
  },
  {
    slug: 'the-case-for-the-quiet-street',
    title: 'The case for the quiet street',
    category: 'Neighborhoods',
    date: '2026-08-03',
    read: '4 min',
    excerpt: 'Why the rhythm of a street often matters more than the size of the lot.',
    image: img.oak,
    body: [
      'A neighborhood is a set of habits: when streets fill, where people walk, how far the sound of the road carries.',
      'Spend a weekday evening and a weekend morning in an area before deciding. What you notice will be more useful than any statistic.',
    ],
  },
  {
    slug: 'materials-that-age-well',
    title: 'Materials that age well',
    category: 'Architecture',
    date: '2026-07-18',
    read: '6 min',
    excerpt: 'Concrete, charred cedar, travertine and bronze: what to look for as surfaces weather.',
    image: img.blackwood,
    body: [
      'Honest materials improve with time. Charred timber develops depth, bronze takes on a patina, and board-formed concrete records its own making.',
      'When evaluating a home, look at how existing surfaces have weathered. It is the most reliable preview of the next ten years.',
    ],
  },
  {
    slug: 'what-a-private-advisor-does',
    title: 'What a private advisor actually does',
    category: 'Advisory',
    date: '2026-06-21',
    read: '4 min',
    excerpt: 'From off-market introductions to due diligence: the work behind a considered acquisition.',
    image: img.desert,
    body: [
      'A private advisor works before and after the transaction: understanding priorities, introducing suitable homes, and coordinating specialists.',
      'The aim is a decision that still feels right years later, not simply a closed deal.',
    ],
  },
]
