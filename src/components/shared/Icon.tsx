import type { CSSProperties } from 'react'

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const PATHS: Record<string, React.ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" {...S} /><path d="M5 9.5V20h14V9.5" {...S} /></>,
  lightbulb: <><path d="M9 18h6" {...S} /><path d="M10 21h4" {...S} /><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1.5 1.7 1.5 2.5v1h5v-1c0-.8.7-1.7 1.5-2.5A6 6 0 0 0 12 3z" {...S} /></>,
  pencil: <><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" {...S} /><path d="M14 7l3 3" {...S} /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8L3 12z" {...S} /><circle cx="7.5" cy="7.5" r="1.2" {...S} /></>,
  align: <><path d="M4 6h16M4 10h10M4 14h16M4 18h8" {...S} /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" {...S} /><circle cx="9" cy="10" r="1.5" {...S} /><path d="m21 17-5-5-9 9" {...S} /></>,
  hash: <><path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" {...S} /></>,
  mic: <><rect x="9" y="3" width="6" height="12" rx="3" {...S} /><path d="M5 12a7 7 0 0 0 14 0" {...S} /><path d="M12 19v2" {...S} /></>,
  film: <><rect x="3" y="4" width="18" height="16" rx="2" {...S} /><path d="M3 8h3M3 12h3M3 16h3M18 8h3M18 12h3M18 16h3" {...S} /></>,
  sparkles: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" {...S} /><path d="m6 6 2 2M16 16l2 2M6 18l2-2M16 8l2-2" {...S} /></>,
  split: <><path d="M4 6h4l6 12h6" {...S} /><path d="M4 18h4l3-6" {...S} /><path d="m18 4 3 2-3 2M18 14l3 2-3 2" {...S} /></>,
  trend: <><path d="M3 17 9 11l4 4 8-8" {...S} /><path d="M14 7h7v7" {...S} /></>,
  chart: <><path d="M4 20V6M10 20v-8M16 20v-5M22 20H2" {...S} /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" {...S} /><path d="M3 9h18M8 3v4M16 3v4" {...S} /></>,
  link: <><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" {...S} /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" {...S} /></>,
  bag: <><path d="M5 7h14l-1 13H6L5 7z" {...S} /><path d="M9 7a3 3 0 0 1 6 0" {...S} /></>,
  download: <><path d="M12 3v12" {...S} /><path d="m7 10 5 5 5-5" {...S} /><path d="M5 21h14" {...S} /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" {...S} /><path d="m9 12 2 2 4-4" {...S} /></>,
  cog: <><circle cx="12" cy="12" r="3" {...S} /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" {...S} /></>,
  search: <><circle cx="11" cy="11" r="7" {...S} /><path d="m17 17 4 4" {...S} /></>,
  bell: <><path d="M6 17V11a6 6 0 1 1 12 0v6l1 2H5l1-2z" {...S} /><path d="M10 21h4" {...S} /></>,
  plus: <><path d="M12 5v14M5 12h14" {...S} /></>,
  arrowRight: <><path d="M4 12h16M14 6l6 6-6 6" {...S} /></>,
  arrowLeft: <><path d="M20 12H4M10 6l-6 6 6 6" {...S} /></>,
  check: <><path d="m5 12 5 5 9-9" {...S} /></>,
  x: <><path d="M6 6l12 12M18 6 6 18" {...S} /></>,
  play: <><path d="M6 4v16l14-8L6 4z" {...S} /></>,
  ellipsis: <><circle cx="5" cy="12" r="1.2" {...S} /><circle cx="12" cy="12" r="1.2" {...S} /><circle cx="19" cy="12" r="1.2" {...S} /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" {...S} /><path d="M21 3v5h-5" {...S} /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" {...S} /><path d="M3 21v-5h5" {...S} /></>,
  save: <><path d="M5 3h11l3 3v15H5V3z" {...S} /><path d="M7 3v6h9V3M7 15h10" {...S} /></>,
  sliders: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" {...S} /><circle cx="14" cy="6" r="2" {...S} /><circle cx="10" cy="12" r="2" {...S} /><circle cx="18" cy="18" r="2" {...S} /></>,
  upload: <><path d="M12 20V8" {...S} /><path d="m7 13 5-5 5 5" {...S} /><path d="M5 3h14" {...S} /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" {...S} /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" {...S} /></>,
  star: <><path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.1L12 17.5 6.5 20.2l1-6.1L3 9.7l6.2-.9L12 3z" {...S} /></>,
  clock: <><circle cx="12" cy="12" r="9" {...S} /><path d="M12 7v5l3 2" {...S} /></>,
  flame: <><path d="M12 3s4 4 4 9a4 4 0 1 1-8 0c0-2 1-3 1-3 0 2 2 2 2-1 0-2-1-3 1-5z" {...S} /></>,
  grid: <><rect x="3" y="3" width="8" height="8" rx="1.5" {...S} /><rect x="13" y="3" width="8" height="8" rx="1.5" {...S} /><rect x="3" y="13" width="8" height="8" rx="1.5" {...S} /><rect x="13" y="13" width="8" height="8" rx="1.5" {...S} /></>,
  chat: <><path d="M4 5h16v11H8l-4 4V5z" {...S} /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...S} /><circle cx="9" cy="7" r="4" {...S} /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...S} /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...S} /><path d="m16 17 5-5-5-5" {...S} /><path d="M21 12H9" {...S} /></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...S} /><circle cx="12" cy="12" r="3" {...S} /></>,
  eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" {...S} /><path d="M1 1l22 22" {...S} /></>,
}

interface IconProps {
  name: string
  size?: number
  className?: string
  style?: CSSProperties
}

export default function Icon({ name, size = 16, className = '', style = {} }: IconProps) {
  const body = PATHS[name]
  if (!body) return null
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      aria-hidden="true"
    >
      {body}
    </svg>
  )
}
