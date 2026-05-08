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

  // Standalone tools
  { code: 'T7',  id: 'trending',    name: 'Trending Finder',          path: '/trending',               icon: 'trend',     group: 'tool' },
  { code: 'T8',  id: 'stats',       name: 'Channel Stats',            path: '/stats',                  icon: 'chart',     group: 'tool' },
  { code: 'T10', id: 'calendar',    name: 'Content Calendar',         path: '/calendar',               icon: 'calendar',  group: 'tool' },
  { code: 'T15', id: 'linkinbio',   name: 'Link in Bio',              path: '/linkinbio',              icon: 'link',      group: 'tool' },

  // Admin
  { code: 'T9',  id: 'admin',       name: 'Prompt Admin',             path: '/admin',                  icon: 'cog',       group: 'admin' },
]

export const GROUPS: Group[] = [
  { id: 'create', label: 'Create' },
  { id: 'tool',   label: 'Tool' },
  { id: 'admin',  label: 'Admin' },
]
