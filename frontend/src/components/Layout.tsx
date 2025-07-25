import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  userType: "tutor" | "student";
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userType, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userType={userType}
      />

      <div className="flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} onLogout={onLogout} />

        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
