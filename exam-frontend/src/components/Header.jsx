import { FaBars, FaBell, FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getMe } from "../api/userApi";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ collapsed, toggleCollapse }) {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch User Data
    getMe()
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));

    // 2. Mock Notification Count
    setUnreadCount(3);

    // 3. Scroll Listener for Glassmorphism
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= DESIGN CONSTANTS (MATCHED TO SIDEBAR) ================= */
  const colors = {
    bg: "#0f172a",         // Sidebar Slate
    inputBg: "#1e293b",    // Lighter Slate for inputs
    text: "#f8fafc",       // Off-white
    muted: "#94a3b8",      // Slate 400
    accent: "#818cf8",     // Indigo 400
    border: "rgba(255, 255, 255, 0.06)" 
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 1.5rem",
    backgroundColor: isScrolled ? "rgba(15, 23, 42, 0.9)" : colors.bg,
    color: colors.text,
    borderBottom: `1px solid ${colors.border}`,
    height: "65px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    transition: "all 0.3s ease",
    backdropFilter: isScrolled ? "blur(12px)" : "none",
    boxShadow: isScrolled ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)" : "none",
  };

  const searchBoxStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    padding: "0.5rem 1rem",
    borderRadius: "10px",
    width: "300px",
    marginLeft: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "all 0.2s ease",
  };

  const badgeStyle = {
    position: "absolute",
    top: "4px",
    right: "4px",
    backgroundColor: "#ef4444", // Red 500
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    height: "16px",
    width: "16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `2px solid ${colors.bg}`,
  };

  const avatarStyle = {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    objectFit: "cover",
    backgroundColor: colors.accent,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)"
  };

  return (
    <div style={headerStyle}>
      {/* LEFT SECTION: Toggle & Search */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <button 
          onClick={toggleCollapse} 
          style={{ 
            border: "none", 
            background: colors.inputBg, 
            color: colors.text, 
            padding: "8px", 
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "background 0.2s"
          }} 
          onMouseOver={(e) => e.currentTarget.style.background = "#334155"}
          onMouseOut={(e) => e.currentTarget.style.background = colors.inputBg}
        >
          <FaBars size={18} />
        </button>
        
        <div style={searchBoxStyle} className="d-none d-md-flex">
          <FaSearch style={{ color: colors.muted, fontSize: "0.85rem", marginRight: "10px" }} />
          <input 
            type="text" 
            placeholder="Search records..." 
            style={{ 
              border: "none", 
              background: "transparent", 
              outline: "none", 
              fontSize: "0.85rem",
              color: colors.text,
              width: "100%"
            }} 
          />
          <div style={{ 
            backgroundColor: "#334155", 
            padding: "2px 6px", 
            borderRadius: "4px", 
            fontSize: "10px", 
            color: colors.muted,
            fontWeight: "bold"
          }}>
            ⌘ K
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Notifications & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        
       

        {/* Vertical Separator */}
        <div style={{ width: "1px", height: "24px", backgroundColor: colors.border }}></div>

        {/* User Profile */}
        {user && (
          <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "0.85rem", textDecoration: "none" }}>
            <div style={{ textAlign: "right" }} className="d-none d-sm-block">
              <div style={{ fontWeight: "600", fontSize: "0.85rem", color: colors.text, lineHeight: "1.2" }}>
                {user.fullName}
              </div>
              <div style={{ fontSize: "0.7rem", color: colors.accent, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {user.role}
              </div>
            </div>
            
            {user.image ? (
              <img src={user.image} alt="avatar" style={avatarStyle} />
            ) : (
              <div style={avatarStyle}>{user.fullName ? user.fullName[0].toUpperCase() : "U"}</div>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}