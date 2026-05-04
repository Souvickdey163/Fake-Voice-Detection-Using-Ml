import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import { UserProvider } from './context/UserContext';

const AppShell = ({ children, contentClassName = 'pt-24 pb-12 sm:pt-28 sm:pb-16' }) => (
  <div className="min-h-screen flex flex-col relative overflow-hidden">
    <Navbar />
    <main className={`flex-1 z-10 ${contentClassName}`}>{children}</main>

    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      <div className="absolute left-[-8%] top-[-6%] h-[22rem] w-[22rem] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute right-[-10%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-violet-500/20 blur-[140px]" />
      <div className="absolute bottom-[-12%] left-[22%] h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-[110px]" />
    </div>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/auth" />;
  }
  return (
    <AppShell contentClassName="pt-24 pb-10 sm:pt-28 sm:pb-12">
      <div className="z-10 flex-1 px-4 py-4 sm:p-6">
        {children}
      </div>
    </AppShell>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ className: '!bg-gray-800 !text-white' }} />
        <Routes>
          <Route
            path="/"
            element={
              <AppShell contentClassName="pt-24 sm:pt-28">
                <Home />
              </AppShell>
            }
          />
          <Route
            path="/about"
            element={
              <AppShell contentClassName="pt-24 sm:pt-28">
                <About />
              </AppShell>
            }
          />
          <Route
            path="/pricing"
            element={
              <AppShell>
                <Pricing />
              </AppShell>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
