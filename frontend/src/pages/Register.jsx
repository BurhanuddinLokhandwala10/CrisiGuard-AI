import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'responder') navigate('/responder');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden glass-panel border-white/40 border">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-100 p-3 rounded-full">
              <UserPlus className="h-10 w-10 text-brand-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Create Account</h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" name="name" required className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" name="email" required className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" name="password" required className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role Request</label>
              <select name="role" className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand-500 outline-none" onChange={handleChange}>
                <option value="user">Civilian (User)</option>
                <option value="responder">First Responder</option>
              </select>
            </div>
            <button type="submit" className="w-full mt-4 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg">
              Register
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
