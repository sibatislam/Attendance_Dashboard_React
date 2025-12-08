import { Outlet } from 'react-router-dom'
import TeamsSidebar from './components/TeamsSidebar'
import HeaderBar from './components/HeaderBar'

function TeamsApp() {
  return (
    <div className="h-screen overflow-hidden relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: 'url(/background.jpg)',
          zIndex: 0
        }}
      ></div>
      
      <div className="flex h-full relative z-10">
        <TeamsSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <HeaderBar />
          <main className="flex-1 overflow-auto px-4 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default TeamsApp

