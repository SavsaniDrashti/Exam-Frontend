import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layout/MainLayout";
import Teachers from "./pages/Teacher";
import AssignSubject from "./pages/AssignSubject";
import MySubjects from "./pages/MySubjects";
import TeacherExam from "./pages/TeacherExam";
import CreateExam from "./pages/CreateExam";
import AssignExam from "./pages/AssignExam";
import MyExams from "./pages/MyExams";
import AllAssignments from "./pages/AllAssignments";
import CreateQuestions from "./pages/CreateQuestions";
import QuestionPaper from "./pages/QuestionPaper";
import StudentExam from "./pages/StudentExam";
import ExamPage from "./pages/ExamPage";
import ExamStatus from "./pages/ExamStatus";
import TeacherAssignments from "./pages/TeacherAssignments";
import ReviewStudentAnswers from "./pages/ReviewStudentAnswers";
import ExamAttempts from "./pages/ExamAttempts";
import ViewResult from "./pages/ViewResult";
import AllResults from "./pages/AllResults";
import TeacherResults from "./pages/TeacherResults";
import StudentResults from "./pages/StudentResults";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - No Layout */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔒 PROTECTED SECTION: All routes here render inside MainLayout */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Admin", "Teacher", "Student"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard & Profile */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          

          {/* Admin Specific */}
          <Route path="users" element={<Users />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="assign-subject" element={<AssignSubject />} />

          {/* Teacher Specific */}
          <Route path="my-subjects" element={<MySubjects />} />
          <Route path="teacher-exams" element={<TeacherExam />} />
          <Route path="teacher-assignments" element={<TeacherAssignments />} />
          <Route path="create-exam" element={<CreateExam />} />
          <Route path="assign-exam" element={<AssignExam />} />
          <Route path="my-exams" element={<MyExams />} />
          <Route path="questions/create" element={<CreateQuestions />} />
          <Route path="questions" element={<QuestionPaper />} />
          <Route path="results-exam" element={<TeacherResults />} />
          <Route path="teacher/exam/:examId/attempts" element={<ExamAttempts />} />
          <Route path="teacher/review/:studentExamId" element={<ReviewStudentAnswers />} />
          <Route path="teacher/result/:studentExamId" element={<ViewResult />} />

          {/* Student Specific */}
          <Route path="student/exam" element={<StudentExam />} />
          <Route path="student/examstatus" element={<ExamStatus />} />
          <Route path="student/exam/:examId" element={<ExamPage />} />
          <Route path="my-results" element={<StudentResults />} />
          <Route path="student/view-pdf/:studentExamId" element={<ViewResult />} />

          {/* Shared / General Protected */}
          <Route path="subjects" element={<Subjects />} />
          <Route path="all-assignments" element={<AllAssignments />} />
          <Route path="all-results" element={<AllResults />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}