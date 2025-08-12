import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [activeModule, setActiveModule] = useState("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" data-testid="main-layout">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar activeModule={activeModule} />
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
