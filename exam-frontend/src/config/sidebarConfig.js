const sidebarConfig = {
  Admin: [
    {
      label: "Dashboard",
      icon: "bi-speedometer2",
      path: "/dashboard"
    },
    {
      label: "Exams",
      icon: "bi-journal-text",
      children: [
        { label: "All Exams", path: "/exams" },
        { label: "Assign Exam", path: "/assign-exam" }
      ]
    },
    {
      label: "Subjects",
      icon: "bi-book",
      path: "/subjects"
    },
    {
      label: "Users",
      icon: "bi-people",
      path: "/users"
    },
    {
      label: "Results",
      icon: "bi-bar-chart",
      path: "/results/all"
    }
  ],

  Teacher: [
    {
      label: "Dashboard",
      icon: "bi-speedometer2",
      path: "/dashboard"
    },
    {
      label: "My Exams",
      icon: "bi-journal-check",
      path: "/exams"
    },
    {
      label: "Questions",
      icon: "bi-question-circle",
      path: "/questions"
    },
    {
      label: "Evaluate",
      icon: "bi-check-circle",
      path: "/evaluate"
    }
  ],

  Student: [
    {
      label: "Dashboard",
      icon: "bi-speedometer2",
      path: "/dashboard"
    },
    {
      label: "My Exams",
      icon: "bi-pencil-square",
      path: "/student/exams"
    },
    {
      label: "My Results",
      icon: "bi-award",
      path: "/student/results"
    }
  ]
};

export default sidebarConfig;
