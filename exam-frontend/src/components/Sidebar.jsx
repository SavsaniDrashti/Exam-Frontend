import { useEffect, useState } from "react";
import { getMe } from "../api/userApi";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // For smooth dropdowns
import {
  FaUser, FaBook, FaClipboardList, FaFileAlt, FaUsers, FaPlus, FaList,
  FaTasks, FaSignOutAlt, FaGraduationCap, FaThLarge, FaChalkboardTeacher,
  FaUserCheck, FaPoll, FaQuestionCircle, FaFileSignature, FaHistory, FaChevronDown
} from "react-icons/fa";

export default function Sidebar({ collapsed }) {
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!user) return null;

  const colors = {
    bg: "#ffffff",
    sidebarBg: "#0f172a", // Darker Slate for premium feel
    itemHover: "rgba(99, 102, 241, 0.1)",
    textLight: "#f8fafc",
    textMuted: "#94a3b8",
    primary: "#818cf8", // Soft indigo
    danger: "#f87171"
  };

  const menus = {
    Admin: [
      { name: "Dashboard", path: "/dashboard", icon: <FaThLarge /> },
      { name: "Users", path: "/users", icon: <FaUsers /> },
      { name: "Subjects", path: "/subjects", icon: <FaBook /> },
      { name: "Teachers", path: "/teachers", icon: <FaChalkboardTeacher /> },
      { name: "Assign Subject", path: "/assign-subject", icon: <FaUserCheck /> },
      { name: "Results", path: "/all-results", icon: <FaPoll /> },
    ],
    Teacher: [
      { name: "Dashboard", path: "/dashboard", icon: <FaThLarge /> },
      {
        name: "Exams",
        icon: <FaClipboardList />,
        dropdown: [
          { name: "Create Exam", path: "/create-exam", icon: <FaPlus /> },
          { name: "Assign Exam", path: "/assign-exam", icon: <FaTasks /> },
          { name: "My Exams", path: "/my-exams", icon: <FaList /> },
        ],
      },
      {
        name: "Questions",
        icon: <FaQuestionCircle />,
        dropdown: [
          { name: "Bank", path: "/questions", icon: <FaList /> },
          { name: "Add New", path: "/questions/create", icon: <FaPlus /> },
        ],
      },
      { name: "Submissions", path: "/teacher-assignments", icon: <FaFileSignature /> },
      { name: "Grading", path: "/results-exam", icon: <FaPoll /> },
    ],
    Student: [
      { name: "Dashboard", path: "/dashboard", icon: <FaThLarge /> },
      { name: "Available Exams", path: "/student/exam", icon: <FaClipboardList /> },
      { name: "Exam Status", path: "/student/examstatus", icon: <FaHistory /> },
      { name: "My Results", path: "/my-results", icon: <FaPoll /> },
    ],
  };

  const roleMenus = menus[user.role] || [];

  const linkStyle = (active, isDropdownItem = false) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: isDropdownItem ? "10px 16px 10px 48px" : "12px 16px",
    color: active ? colors.textLight : colors.textMuted,
    backgroundColor: active ? "rgba(99, 102, 241, 0.15)" : "transparent",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: active ? "600" : "500",
    borderRadius: "8px",
    margin: "4px 12px",
    transition: "all 0.2s ease",
    borderLeft: active ? `3px solid ${colors.primary}` : "3px solid transparent",
  });

  return (
    <div style={{
      width: collapsed ? "80px" : "260px",
      height: "100vh",
      position: "sticky",
      top: 0,
      backgroundColor: colors.sidebarBg,
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column",
      boxShadow: "4px 0 10px rgba(0,0,0,0.05)",
      overflow: "hidden"
    }}>
      
      {/* 1. BRANDING SECTION */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            background: colors.primary, 
            padding: "8px", 
            borderRadius: "10px", 
            display: "flex", 
            color: "white" 
          }}>
            <FaGraduationCap size={20} />
          </div>
          {!collapsed && (
            <span style={{ fontWeight: "800", color: "white", letterSpacing: "1px", fontSize: "1rem" }}>
              EDUMETRICS
            </span>
          )}
        </div>
      </div>

      {/* 2. USER PROFILE MINI-CARD */}
      {!collapsed && (
        <div style={{ padding: "20px 12px" }}>
          <div style={{ 
            backgroundColor: "rgba(255,255,255,0.03)", 
            padding: "12px", 
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div style={{ color: "white", fontWeight: "600", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.fullName}
            </div>
            <div style={{ color: colors.primary, fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
              {user.role}
            </div>
          </div>
        </div>
      )}

      {/* 3. NAVIGATION */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "10px 0" }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {roleMenus.map((menu) => {
            const isActive = location.pathname === menu.path;
            const isOpen = openDropdown === menu.name;

            if (menu.dropdown) {
              return (
                <li key={menu.name} style={{ marginBottom: "4px" }}>
                  <div
                    style={{ ...linkStyle(false), cursor: "pointer" }}
                    onClick={() => setOpenDropdown(isOpen ? null : menu.name)}
                  >
                    <span style={{ fontSize: "1.1rem", display: "flex" }}>{menu.icon}</span>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{menu.name}</span>
                        <FaChevronDown 
                          size={10} 
                          style={{ transition: "transform 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }} 
                        />
                      </>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {!collapsed && isOpen && (
                      <motion.ul 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ listStyle: "none", padding: 0, overflow: "hidden" }}
                      >
                        {menu.dropdown.map((item) => (
                          <li key={item.path}>
                            <Link to={item.path} style={linkStyle(location.pathname === item.path, true)}>
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            return (
              <li key={menu.path}>
                <Link to={menu.path} style={linkStyle(isActive)}>
                  <span style={{ fontSize: "1.1rem", display: "flex" }}>{menu.icon}</span>
                  {!collapsed && <span>{menu.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 4. FOOTER / LOGOUT */}
      <div style={{ padding: "16px", background: "rgba(0,0,0,0.2)" }}>
        <button
          onClick={() => { localStorage.clear(); window.location.href = "/"; }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "12px",
            padding: "12px",
            background: "transparent",
            color: colors.danger,
            border: "1px solid rgba(248, 113, 113, 0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)"}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          <FaSignOutAlt size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}