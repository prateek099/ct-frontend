export interface Tool {
  code: string
  id: string
  name: string
  path: string
  icon: string
  group: string
}

export interface Group {
  id: string
  label: string
}

export const TOOLS: Tool[] = [
  // Create
  { code: 'T1',  id: 'idea',        name: 'Video Ideas',              path: '/idea',                   icon: 'lightbulb', group: 'create' },
  { code: 'T2',  id: 'script',      name: 'Script Writer',            path: '/script',                 icon: 'pencil',    group: 'create' },
  { code: 'T3',  id: 'title',       name: 'Title Generator',          path: '/title',                  icon: 'tag',       group: 'create' },
  { code: 'T4',  id: 'description', name: 'Description + Hashtags',   path: '/description',            icon: 'align',     group: 'create' },
  { code: 'T5',  id: 'thumbnail',   name: 'Thumbnail Lab',            path: '/thumbnail',              icon: 'image',     group: 'create' },
  { code: 'T11', id: 'voiceover',   name: 'AI Voiceover',             path: '/voiceover',              icon: 'mic',       group: 'create' },
  { code: 'T13', id: 'video',       name: 'Video Generator',          path: '/video',                  icon: 'film',      group: 'create' },

  // Improve
  { code: 'T12', id: 'review',      name: 'Review My Script',         path: '/review',                 icon: 'sparkles',  group: 'improve' },
  { code: 'T14', id: 'repurpose',   name: 'Cross-Platform Repurpose', path: '/repurpose',              icon: 'split',     group: 'improve' },

  // Research
  { code: 'T7',  id: 'trending',    name: 'Trending Finder',          path: '/trending',               icon: 'trend',     group: 'research' },
  { code: 'T8',  id: 'stats',       name: 'Channel Stats',            path: '/stats',                  icon: 'chart',     group: 'research' },

  // Plan
  { code: 'T10', id: 'calendar',    name: 'Content Calendar',         path: '/calendar',               icon: 'calendar',  group: 'plan' },

  // Publish
  { code: 'T15', id: 'linkinbio',   name: 'Link in Bio',              path: '/linkinbio',              icon: 'link',      group: 'publish' },
  { code: 'T16', id: 'shop',        name: 'My Shop',                  path: '/shop',                   icon: 'bag',       group: 'publish' },

  // Utilities
  { code: 'T17', id: 'thumb-dl',    name: 'Thumbnail Downloader',     path: '/thumbnail-downloader',   icon: 'download',  group: 'utility' },
  { code: 'T18', id: 'subs-dl',     name: 'Subtitles Downloader',     path: '/subtitles-downloader',   icon: 'download',  group: 'utility' },
  { code: 'T19', id: 'copyright',   name: 'Copyright Checker',        path: '/copyright',              icon: 'shield',    group: 'utility' },

  // Admin
  { code: 'T9',  id: 'admin',       name: 'Prompt Admin',             path: '/admin',                  icon: 'cog',       group: 'admin' },
]

export const GROUPS: Group[] = [
  { id: 'create',   label: 'Create' },
  { id: 'improve',  label: 'Improve' },
  { id: 'research', label: 'Research' },
  { id: 'plan',     label: 'Plan' },
  { id: 'publish',  label: 'Publish' },
  { id: 'utility',  label: 'Utilities' },
  { id: 'admin',    label: 'Admin' },
]
