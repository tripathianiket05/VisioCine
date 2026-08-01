import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../apiClient';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await apiClient.post('/api/auth/register', { name, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col justify-center items-center px-4 pt-20">
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary"></div>
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-primary uppercase tracking-wider mb-2">Cineplex</h1>
          <p className="text-on-surface-variant font-body-md">Create a new account</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm font-label-md text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-label-md text-on-surface-variant mb-1.5">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-label-md text-on-surface-variant mb-1.5">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-label-md text-on-surface-variant mb-1.5">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-primary hover:bg-inverse-primary text-white font-label-md py-3.5 rounded-lg transition-all duration-300 glow-crimson disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center flex flex-col gap-2">
          <p className="text-on-surface-variant text-sm font-body-md">
            Already have an account? <Link to="/login" className="text-primary hover:text-inverse-primary transition-colors">Sign in</Link>
          </p>
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-label-md mt-2">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
