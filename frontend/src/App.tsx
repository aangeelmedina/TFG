
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import ProtectedRoute from "./helpers/ProtectedRoute"
import Home from "./pages/home/Home"
import Login from "./pages/Auth/Login"
import SetPasswordPage from "./pages/Auth/SetPasswordPage"
import Navbar from "./components/Navbar/Navbar"
import CentroAdminPage from "./pages/centros/Centroadminpage"


// ... imports ...

const App = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/set-password'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route 
            path="/login" 
            element={<Login/>}
        />
        <Route 
            path="/set-password" 
            element={<SetPasswordPage/>}
        />
        <Route path="/home" element={
          <ProtectedRoute >
            <Home />
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