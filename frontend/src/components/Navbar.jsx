import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'responder' ? '/responder' : '/dashboard') : '/login'} className="flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-danger-500" />
            <span className="font-bold text-xl tracking-tight text-slate-900">CrisisGuard AI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex space-x-4 animate-in fade-in mr-4 items-center">
                  <Link to="/dashboard" className="text-slate-600 hover:text-brand-600 px-3 py-2 text-sm font-semibold transition-colors">User Dashboard</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-slate-600 hover:text-brand-600 px-3 py-2 text-sm font-semibold transition-colors">Admin Portal</Link>
                  )}
                </div>
                <div className="flex flex-col text-right hidden lg:flex border-l pl-4 border-slate-200">
                  <span className="text-sm font-bold text-slate-800">{user.name}</span>
                  <span className="text-[10px] text-brand-600 uppercase font-bold tracking-widest">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 ml-2 text-slate-500 hover:text-danger-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex space-x-4 animate-in fade-in slide-in-from-top-2">
                <Link to="/login" className="text-slate-600 hover:text-brand-600 px-3 py-2 font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
