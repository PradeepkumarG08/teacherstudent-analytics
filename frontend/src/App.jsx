import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Articles from "./pages/Articles"
import ArticleReader from "./pages/ArticleReader"
import TeacherDashboard from "./pages/TeacherDashboard"
import StudentDashboard from "./pages/StudentDashboard"

import Navbar from "./components/Navbar"

import "./App.css"


/* =========================
   PROTECTED ROUTE
========================= */
function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}


/* =========================
   ROLE BASED ROUTE
========================= */
function RoleRoute({ children, role }) {

  const token = localStorage.getItem("token")
  const userRole = localStorage.getItem("role")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (userRole !== role) {

    if (userRole === "teacher") {
      return <Navigate to="/teacher" replace />
    }

    if (userRole === "student") {
      return <Navigate to="/student" replace />
    }

    return <Navigate to="/login" replace />
  }

  return children
}


/* =========================
   NAVBAR CONTROL
========================= */
function Layout({ children }) {

  const location = useLocation()

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register"

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  )
}



/* =========================
   APP
========================= */

function App() {

  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  return (

    <BrowserRouter>

      <Layout>

        <Routes>

          {/* AUTH */}

          <Route
            path="/"
            element={
              token
                ? role === "teacher"
                  ? <Navigate to="/teacher" />
                  : <Navigate to="/student" />
                : <Login />
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          {/* ARTICLES */}

          <Route
            path="/articles"
            element={
              <ProtectedRoute>
                <Articles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/article/:id"
            element={
              <ProtectedRoute>
                <ArticleReader />
              </ProtectedRoute>
            }
          />


          {/* TEACHER */}

          <Route
            path="/teacher"
            element={
              <RoleRoute role="teacher">
                <TeacherDashboard />
              </RoleRoute>
            }
          />


          {/* STUDENT */}

          <Route
            path="/student"
            element={
              <RoleRoute role="student">
                <StudentDashboard />
              </RoleRoute>
            }
          />


          {/* UNKNOWN */}

          <Route path="*" element={<Navigate to="/" />} />

        </Routes>

      </Layout>

    </BrowserRouter>

  )
}

export default App