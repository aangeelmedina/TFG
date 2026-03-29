
import { Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./helpers/ProtectedRoute"
import Home from "./pages/home/Home"
import Login from "./pages/Auth/Login"
import Navbar from "./components/Navbar/Navbar"
import DashboardAnalytics from "./pages/DashBoard/DashboardAnalytics"
import CentroAdminPage from "./pages/centros/Centroadminpage"


// ... imports ...

const App = () => {

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route 
            path="/login" 
            element={<Login/>}
        />
        <Route path="/home" element={
          <ProtectedRoute >
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute >
            <DashboardAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/centros/:centroId/admin" element={
            <ProtectedRoute >
              <CentroAdminPage />
            </ProtectedRoute>
          } />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </div>
  )
}
export default App