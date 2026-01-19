// ... imports

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  // Extract the token from the URL (?token=xyz)
  const token = searchParams.get("token");

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ type: "danger", message: "Passwords do not match." });
    }
    
    if (!token) {
      return setStatus({ type: "danger", message: "Invalid reset token. Please request a new link." });
    }

    setLoading(true);
    try {
      // Matches [HttpPost("reset-password")] 
      // Payload: { token, newPassword }
      await api.post("/users/reset-password", { 
        token: token, 
        newPassword: password 
      });

      setStatus({ type: "success", message: "Password updated successfully! Redirecting to login..." });
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setStatus({ 
        type: "danger", 
        message: err.response?.data || "The link is invalid or has expired." 
      });
    } finally {
      setLoading(false);
    }
  };

  // If no token is present in URL, show a warning immediately
  if (!token) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="bg-white p-5 shadow rounded-4 text-center" style={{ maxWidth: "450px" }}>
          <AlertCircle size={50} className="text-danger mb-3" />
          <h3 className="fw-bold">Invalid Link</h3>
          <p className="text-muted">This password reset link is missing a valid security token.</p>
          <Link to="/forgot-password" title="Go back" className="btn btn-primary w-100">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="bg-white p-5 shadow rounded-4 w-100" style={{ maxWidth: "450px" }}>
        {/* ... (Rest of your UI form code remains the same) ... */}
        {/* Ensure the button has: disabled={loading} */}
        <button type="submit" disabled={loading} className="btn btn-dark w-100 py-3 fw-bold">
           {loading ? <span className="spinner-border spinner-border-sm"></span> : "Update Password"}
        </button>
      </div>
    </div>
  );
}