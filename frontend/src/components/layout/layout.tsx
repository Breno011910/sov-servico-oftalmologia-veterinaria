import React from "react";
import Header from "./header";
import Sidebar from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f7fb",
      }}
    >

      <Header />

      <Sidebar />

      <main
        style={{
          marginLeft: "240px",
          paddingTop: "72px",
          minHeight: "100vh",
          backgroundColor: "#f4f7fb",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>

    </div>
  );
}

export default Layout;