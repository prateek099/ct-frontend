import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="app">
        <Sidebar />
        <div className="main">
          <TopBar />
          <div className="content">{children}</div>
        </div>
      </div>
      <div className="mobile-guard">
        <div>
          <h1>Creator OS</h1>
          <p>Open on a tablet or desktop for the best experience. Creator OS is optimised for screens 768px and wider.</p>
        </div>
      </div>
    </>
  )
}
