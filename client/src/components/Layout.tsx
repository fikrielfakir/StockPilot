import TopNavigation from "./TopNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50" data-testid="main-layout" style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
      <TopNavigation />
      <main className="windows-scrollbar overflow-y-auto" data-testid="main-content" style={{ height: 'calc(100vh - 86px)' }}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
