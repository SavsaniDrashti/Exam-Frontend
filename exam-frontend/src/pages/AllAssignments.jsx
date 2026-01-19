import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  FaSearch, FaFileAlt, FaUserGraduate, 
  FaCheckCircle, FaHourglassHalf, FaUserMinus, FaClock 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import { getAllAssignments, removeAssignedStudent } from "../api/examApi";

export default function AllAssignments() {
  const { theme } = useOutletContext();
  const isDark = theme === "dark";
  
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadAssignments();
    // Update time every minute to keep "Upcoming" status accurate
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await getAllAssignments();
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (examId, studentId, studentName) => {
    const result = await Swal.fire({
      title: 'Revoke Access?',
      text: `Remove ${studentName} from this upcoming exam?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Remove',
      background: isDark ? "#1e293b" : "#fff",
      color: isDark ? "#fff" : "#1e293b"
    });

    if (result.isConfirmed) {
      try {
        await removeAssignedStudent(examId, studentId);
        setAssignments(prev => prev.filter(a => !(a.examId === examId && a.studentId === studentId)));
        Swal.fire('Deleted', 'Student removed from exam.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to remove student.', 'error');
      }
    }
  };

  const filteredData = assignments.filter(a => 
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    card: {
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      borderRadius: "12px",
    },
    tableHead: {
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: "0.75rem",
      textTransform: "uppercase"
    }
  };

  return (
    <div className="container-fluid pb-5">
      <Helmet><title>Enrollment Monitor | EMS</title></Helmet>

      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-6">
          <h4 className="fw-bold mb-1">Enrollment Monitor</h4>
          <p className="text-muted small mb-0">Manage upcoming enrollments or view current exam status.</p>
        </div>
        <div className="col-md-6 d-flex justify-content-md-end">
          <div className="input-group input-group-sm" style={{ maxWidth: "250px" }}>
            <span className="input-group-text bg-transparent border-end-0"><FaSearch className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="Search..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={styles.card} className="shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={styles.tableHead}>
              <tr>
                <th className="px-4 py-3">Exam Details</th>
                <th>Student</th>
                <th>Status</th>
                <th className="text-end px-4">Action</th>
              </tr>
            </thead>
            <tbody className={isDark ? "text-light border-top-0" : "text-dark border-top-0"}>
              {filteredData.map((a, idx) => {
                // Check if exam is upcoming
                const isUpcoming = currentTime < new Date(a.startTime);
                
                return (
                  <tr key={`${a.examId}-${a.studentId}`} className="border-bottom">
                    <td className="px-4 py-3">
                      <div className="fw-bold"><FaFileAlt className="text-primary me-2"/>{a.examName}</div>
                      <small className="text-muted"><FaClock size={10}/> Starts: {new Date(a.startTime).toLocaleString()}</small>
                    </td>
                    <td><FaUserGraduate className="text-muted me-2"/>{a.studentName}</td>
                    <td>
                      {a.isCompleted ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">Completed</span>
                      ) : isUpcoming ? (
                        <span className="badge bg-info-subtle text-info border border-info-subtle">Upcoming</span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Live / Pending</span>
                      )}
                    </td>
                    <td className="text-end px-4">
                      {isUpcoming ? (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemove(a.examId, a.studentId, a.studentName)}
                          title="Delete Enrollment"
                        >
                          <FaUserMinus className="me-1"/> Delete
                        </button>
                      ) : (
                        <span className="text-muted small">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {loading && <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}
        {filteredData.length === 0 && !loading && (
          <div className="text-center py-5 text-muted">No assignments found.</div>
        )}
      </div>
    </div>
  );
}