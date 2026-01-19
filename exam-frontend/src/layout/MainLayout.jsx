import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getMe } from "../api/userApi";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);

  // Fetch user info
  useEffect(() => {
    getMe().then(res => setUser(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme === "dark" ? "#212529" : "#f8f9fa" }}>
      <Sidebar
        collapsed={collapsed}
        theme={theme}
        user={user} // pass user to sidebar
      />
      <div style={{ flexGrow: 1 }}>
        <Header
          collapsed={collapsed}
          toggleCollapse={() => setCollapsed(!collapsed)}
          theme={theme}
          toggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
          user={user} // pass user to header
        />
        <div style={{ }}>
          <Outlet context={{ user, setUser, theme }} /> {/* provide context for Profile page */}
        </div>
      </div>
    </div>
  );
}
