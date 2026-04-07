import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mic, LayoutDashboard, History, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-400 bg-gray-800/50' : 'text-gray-300 hover:text-white hover:bg-gray-800/30';
  };

  return (
    <nav className="glass-panel mx-6 mt-6 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Mic className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-wide text-white">Truth<span className="text-blue-500">Voice</span></span>
      </div>

      <div className="flex items-center space-x-2">
        <Link to="/dashboard" className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${isActive('/dashboard')}`}>
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <Link to="/history" className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${isActive('/history')}`}>
          <History className="w-4 h-4" />
          <span>History</span>
        </Link>
        <div className="w-px h-6 bg-gray-700 mx-2"></div>
        <button 
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
