import type { Img } from '../cms/types'

export type { Img }

// Seed photography shipped in /public/seed (served from stable URLs).
const mk = (name: string, w: number, h: number): Img => ({ src: `/seed/${name}.webp`, sm: `/seed/${name}-sm.webp`, w, h })

export const img = {
  pine: mk('pine-pavilion', 1376, 768),
  desert: mk('desert-house', 1200, 896),
  blackwood: mk('blackwood', 1376, 768),
  glass: mk('glass-residence', 1376, 768),
  oak: mk('oak-enclave', 1376, 768),
  westLakeHills: mk('west-lake-hills', 1200, 896),
  paradiseValley: mk('paradise-valley', 1200, 896),
  highlandPark: mk('highland-park', 1200, 896),
  alexandra: mk('alexandra-bennett', 1024, 1024),
  elena: mk('elena-rostova', 896, 1200),
  marcus: mk('marcus-vance', 896, 1200),
}
