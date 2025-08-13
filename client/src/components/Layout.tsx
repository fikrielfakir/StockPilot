import FluentTopNav from "./FluentTopNav";
import FluentSidebar from "./FluentSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30" 
         data-testid="main-layout" 
         style={{ fontFamily: 'var(--font-family-segoe)' }}>
      
      {/* Top Navigation */}
      <FluentTopNav />
      
      {/* Main Content Area */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <FluentSidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
