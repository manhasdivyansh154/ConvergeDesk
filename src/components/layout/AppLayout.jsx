import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../common/Navbar";
import { Sidebar } from "../common/Sidebar";
import { ApiStatusBanner } from "../common/ApiStatusBanner";

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top System Status Banner */}
      <ApiStatusBanner />

      {/* Main Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        isMobileSidebarOpen={mobileSidebarOpen}
      />

      {/* App Body with Sidebar & Content */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Outlet */}
        <main
          className="main-content-area"
          style={{
            flex: 1,
            backgroundColor: "var(--bg-app)",
            minWidth: 0,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

