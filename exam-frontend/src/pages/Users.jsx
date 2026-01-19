import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getUsers, createUser, updateUser, deleteUser } from "../api/userApi";

/* Handle backend ID variations safely */
const getUserId = (user) =>
  user?.UserId ?? user?.userId ?? user?.id ?? user?.Id ?? null;

export default function Users() {
  const { theme } = useOutletContext() || { theme: "dark" };
  const isAdmin = localStorage.getItem("role") === "Admin";

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    passwordHash: "",
    role: ""
  });

  /* ================= FETCH USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();

      const normalized = Array.isArray(res.data)
        ? res.data.map(u => ({
            UserId: u.UserId ?? u.userId ?? u.id,
            fullName: u.FullName ?? u.fullName,
            email: u.Email ?? u.email,
            role: u.Role ?? u.role
          }))
        : [];

      setUsers(normalized);
    } catch (err) {
      console.error("Load users failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let data = [...users];

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        u =>
          u.fullName?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
      );
    }

    if (roleFilter) data = data.filter(u => u.role === roleFilter);

    setFilteredUsers(data);
  }, [search, roleFilter, users]);

  /* ================= FORM ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      passwordHash: "",
      role: ""
    });
    setEditingId(null);
  };

  const handleEdit = (user) => {
    setEditingId(getUserId(user));
    setForm({
      fullName: user.fullName,
      email: user.email,
      passwordHash: "",
      role: user.role
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...form };

      if (editingId && !payload.passwordHash) {
        delete payload.passwordHash;
      }

      editingId
        ? await updateUser(editingId, payload)
        : await createUser(payload); // SAME AS REGISTER

      loadUsers();
      resetForm();
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await deleteUser(id);
      loadUsers();
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= UI COLORS ================= */
  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    primary: "#818cf8",
    textMuted: "#94a3b8",
    border: "rgba(255,255,255,0.05)"
  };

  const styles = {
    page: {
      backgroundColor: colors.bg,
      minHeight: "100vh",
      padding: "2rem",
      color: "#f8fafc"
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: "16px",
      border: `1px solid ${colors.border}`
    },
    input: {
      backgroundColor: colors.bg,
      color: "#fff",
      border: "1px solid #334155",
      borderRadius: "10px"
    }
  };

  return (
    <div style={styles.page}>
      <Helmet>
        <title>Users | EDUMETRICS</title>
      </Helmet>

      <h3 className="fw-bold mb-1">User Directory</h3>
      <p className="small mb-4" style={{ color: colors.textMuted }}>
        Manage roles & permissions
      </p>

      {/* ================= ADMIN CREATE ================= */}
      {isAdmin && (
        <div style={styles.card} className="p-4 mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUserPlus />
            <h6 className="mb-0 fw-bold">
              {editingId ? "Update User" : "Register User"}
            </h6>
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
              <input
                name="fullName"
                className="form-control shadow-none"
                style={styles.input}
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <input
                name="email"
                type="email"
                className="form-control shadow-none"
                style={styles.input}
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <input
                name="passwordHash"
                type="password"
                className="form-control shadow-none"
                style={styles.input}
                placeholder="Password"
                value={form.passwordHash}
                onChange={handleChange}
                required={!editingId}
              />
            </div>

            <div className="col-md-2">
              <select
                name="role"
                className="form-select shadow-none"
                style={styles.input}
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="">Role</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div className="col-md-1 d-grid">
              <button
                className="btn fw-bold"
                style={{ backgroundColor: colors.primary, color: "#fff" }}
              >
                {editingId ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div style={styles.card} className="p-3">
        <div className="d-flex gap-3 mb-3">
          <input
            className="form-control shadow-none"
            style={{ ...styles.input, maxWidth: "300px" }}
            placeholder="Search name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            className="form-select shadow-none"
            style={{ ...styles.input, maxWidth: "160px" }}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Admin">Admin</option>
            <option value="Teacher">Teacher</option>
            <option value="Student">Student</option>
          </select>
        </div>

        <table className="table table-dark table-hover mb-0">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              {isAdmin && <th className="text-end">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length ? (
              filteredUsers.map(u => (
                <tr key={getUserId(u)}>
                  <td>
                    <div className="fw-bold">{u.fullName}</div>
                    <small className="text-muted">{u.email}</small>
                  </td>

                  <td>
                    <span className="badge bg-secondary">{u.role}</span>
                  </td>

                  {isAdmin && (
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-light me-2"
                        onClick={() => handleEdit(u)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(getUserId(u))}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
