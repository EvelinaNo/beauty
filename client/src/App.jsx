import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { useContext, useEffect } from 'react';
import { AuthContext } from './utils/AuthContext';
import Homepage from './pages/Homepage';
import LoginForm from './components/LoginForm';
import RegistrationPage from './components/RegistrationForm';
import { Services } from './components/Services';
import CreateService from './components/CreateService';
import ServiceRegistration from './components/ServiceRegistration';
import ServiceDetails from './components/ServiceDetails';
import AddReviewForm from './components/AddReviewForm';
import MyServicesPage from './pages/MyServicesPage';
import ManageServices from './pages/ManageServices';
import EditService from './components/EditService';
import ServiceRegistrationEdit from './components/ServiceRegistrationEdit';
import ErrorPage from './pages/ErrorPage';

function App() {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    isAuthenticated;
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        {isAuthenticated ? (
          <>
            <Route path="/create" element={isAdmin ? <CreateService /> : <Navigate to="/" />} />
            <Route
              path="/registrations/admin/services"
              element={isAdmin ? <ManageServices /> : <Navigate to="/" />}
            />
            <Route path="/services/:id/edit" element={isAdmin ? <EditService /> : <Navigate to="/" />} />
            <Route path="/services/:id/register" element={<ServiceRegistration />} />
            <Route path="/services/:id/register-edit/:registration_id" element={<ServiceRegistrationEdit />} />
            <Route path="/users/:userId/my-services" element={<MyServicesPage />} />
            <Route path="/services/:id/addreview" element={<AddReviewForm />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/registration" element={<RegistrationPage />} />
          </>
        )}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
