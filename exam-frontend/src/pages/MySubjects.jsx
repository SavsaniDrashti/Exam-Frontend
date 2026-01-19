import { useEffect, useState } from "react";
import { getMySubjects } from "../api/teacherApi";

export default function MySubjects() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const res = await getMySubjects();
    setSubjects(res.data);
  };

  return (
    <div className="container mt-4">
      <h3>My Assigned Subjects</h3>

      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Subject Name</th>
          </tr>
        </thead>
        <tbody>
          {subjects.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center">
                No subjects assigned
              </td>
            </tr>
          ) : (
            subjects.map((s, index) => (
              <tr key={s.subjectId}>
                <td>{index + 1}</td>
                <td>{s.subjectName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
