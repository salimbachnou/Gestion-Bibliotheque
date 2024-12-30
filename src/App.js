import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import Categories from './pages/Categories';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminBooks from './pages/admin/Books';
import Navbar from './components/Navbar';
import AdminCategories from './pages/admin/Categories';
import Settings from './pages/admin/Settings';
import MyProfile from './pages/client/MyProfile';
import MyLoans from './pages/client/MyLoans';
import MyReservations from './pages/client/MyReservations';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminReservations from './pages/admin/Reservations';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protection des routes admin
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Protection des routes client
const ClientRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Layout pour les pages publiques
const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques avec Navbar */}
          <Route path="/" element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          <Route path="/login" element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          } />
          <Route path="/register" element={
            <PublicLayout>
              <Register />
            </PublicLayout>
          } />
          <Route path="/books" element={
            <PublicLayout>
              <Books />
            </PublicLayout>
          } />
          <Route path="/categories" element={
            <PublicLayout>
              <Categories />
            </PublicLayout>
          } />
          <Route path="/services" element={
            <PublicLayout>
              <Services />
            </PublicLayout>
          } />
          <Route path="/about" element={
            <PublicLayout>
              <About />
            </PublicLayout>
          } />
          <Route path="/contact" element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          } />

          {/* Routes Client */}
          <Route path="/profile" element={
            <PublicLayout>
              <MyProfile />
            </PublicLayout>
          } />
          <Route path="/profile/loans" element={
            <PublicLayout>
              <MyLoans />
            </PublicLayout>
          } />
          <Route path="/profile/reservations" element={
            <PublicLayout>
              <MyReservations />
            </PublicLayout>
          } />

          {/* Routes Admin */}
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/books" element={
            <PrivateRoute>
              <AdminLayout>
                <AdminBooks />
              </AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/categories" element={
            <PrivateRoute>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/settings" element={
            <PrivateRoute>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/reservations" element={
            <PrivateRoute>
              <AdminLayout>
                <AdminReservations />
              </AdminLayout>
            </PrivateRoute>
          } />
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
