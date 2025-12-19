import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { MyLearningPage } from './pages/MyLearningPage';
import { CourseLearningPage } from './pages/CourseLearningPage';
import { WishlistPage } from './pages/WishlistPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { ProfilePage } from './pages/ProfilePage';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { InstructorDashboardPage } from './pages/InstructorDashboardPage';
import { CourseFormPage } from './pages/CourseFormPage';
import { CourseEditPage } from './pages/CourseEditPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/my-learning"
            element={
              <ProtectedRoute>
                <MyLearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <CertificatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:id"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccessPage />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes */}
          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute>
                <InstructorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/create"
            element={
              <ProtectedRoute>
                <CourseFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:id/form"
            element={
              <ProtectedRoute>
                <CourseFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:id/edit"
            element={
              <ProtectedRoute>
                <CourseEditPage />
              </ProtectedRoute>
            }
          />
        </Route>
        
        {/* Course Learning Page (No Layout - Full Screen) */}
        <Route
          path="/courses/:id/learn"
          element={
            <ProtectedRoute>
              <CourseLearningPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
