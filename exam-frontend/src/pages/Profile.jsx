import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getMe, updateUser } from "../api/userApi";
import { Helmet } from "react-helmet-async";
import { FaCamera, FaUserCircle, FaInfoCircle, FaUserShield } from "react-icons/fa";

export default function Profile() {
  const { user, setUser, theme } = useOutletContext() || { theme: "dark" };
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    image: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMe()
      .then(res => {
        setFormData({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          role: res.data.role || "",
          image: res.data.image || "",
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, image: URL.createObjectURL(file), file }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const updatedData = {
        fullName: formData.fullName,
        email: formData.email,
      };

      const targetId = user?.userId || user?.id; 

      if (!targetId) throw new Error("User ID is missing");

      const updatedUser = await updateUser(targetId, updatedData);
      setUser(updatedUser);
      setMessage({ text: "Profile settings synchronized successfully.", type: "success" });
    } catch (err) {
      setMessage({ text: "Synchronization failed. Please try again.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  /* ================= THEME SYNCED WITH DASHBOARD ================= */
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    primary: "#818cf8",
    textMuted: "#94a3b8",
    border: "rgba(255, 255, 255, 0.05)"
  };

  const styles = {
    pageWrapper: {
      backgroundColor: colors.bg,
      minHeight: "100vh",
      padding: "2rem",
      color: "#f8fafc"
    },
    card: {
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: "20px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
      maxWidth: "1000px",
      margin: "0 auto"
    },
    input: {
      backgroundColor: colors.bg,
      color: "#f8fafc",
      border: "1px solid #334155",
      borderRadius: "12px",
      padding: "0.75rem 1rem"
    },
    label: {
      fontSize: "0.75rem",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: colors.textMuted,
      marginBottom: "8px",
      display: "block"
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Helmet><title>Account Settings | EDUMETRICS</title></Helmet>

      <style>{`
        .form-control:focus {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2) !important;
          color: #fff !important;
        }
        .form-control::placeholder { color: #475569; }
        
        .avatar-hover {
          transition: transform 0.3s ease;
        }
        .avatar-hover:hover {
          transform: scale(1.02);
        }

        .upload-badge {
          background: #818cf8;
          color: white;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          cursor: pointer;
          position: absolute;
          bottom: 5px;
          right: 5px;
          border: 3px solid #1e293b;
          transition: all 0.2s;
        }
        .upload-badge:hover {
          background: #6366f1;
          transform: translateY(-2px);
        }

        .role-box {
          background: rgba(15, 23, 42, 0.5);
          border: 1px dashed #334155;
          padding: 1rem;
          border-radius: 12px;
        }
      `}</style>

      <div className="mb-4 text-center">
        <h3 className="fw-bold text-white">Profile Settings</h3>
        <p style={{ color: colors.textMuted }} className="small">Manage your account identity and digital credentials</p>
      </div>

      <div style={styles.card} className="overflow-hidden">
        <div className="card-body p-4 p-md-5">
          
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} border-0 small mb-4 py-3`} style={{ borderRadius: "12px" }}>
              <div className="d-flex align-items-center gap-2">
                {message.type === "success" ? "✓ " : "✕ "}
                {message.text}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* LEFT COLUMN: Avatar Management */}
            

              {/* RIGHT COLUMN: Fields */}
              <div className="col-md-12 mt-4 mt-md-0">
                <div className="row g-4">
                  <div className="col-12">
                    <label style={styles.label}>Full Legal Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control shadow-none border-secondary border-opacity-25"
                      style={styles.input}
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label style={styles.label}>Primary Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control shadow-none border-secondary border-opacity-25"
                      style={styles.input}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label style={styles.label}>Administrative Privileges</label>
                    <div className="role-box d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                         <div className="p-2 rounded-3" style={{backgroundColor: colors.bg, color: colors.primary}}>
                            <FaUserShield />
                         </div>
                         <div>
                            <div className="text-white small fw-bold text-uppercase">{formData.role} ACCESS</div>
                            <div style={{color: colors.textMuted, fontSize: "0.7rem"}}>Permission level is locked to your account type</div>
                         </div>
                      </div>
                      <FaInfoCircle style={{color: colors.textMuted}} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 d-flex justify-content-end gap-3">
                  <button
                    type="submit"
                    className="btn fw-bold px-5 py-2 shadow-sm"
                    style={{ backgroundColor: colors.primary, color: "white", borderRadius: "10px", border: "none" }}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Save Profile Changes"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className="text-center mt-4" style={{ color: colors.textMuted, fontSize: "0.75rem" }}>
        <FaInfoCircle className="me-1" /> Profile updates are applied instantly across the institutional network.
      </div>
    </div>
  );
}