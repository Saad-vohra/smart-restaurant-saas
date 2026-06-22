import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
  const { registerRestaurant } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    restaurantName: '', ownerName: '', email: '', password: '', phone: '', address: ''
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await registerRestaurant(form);
      toast.success(`Welcome to SRMS, ${user.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 440 }}>
        <div className="login-logo">
          <h1>🍽️ SRMS</h1>
          <p>Set up your restaurant in minutes</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Restaurant Name</label>
            <input className="form-input" placeholder="e.g. The Spice Garden"
              value={form.restaurantName} onChange={set('restaurantName')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input className="form-input" placeholder="Owner / Admin name"
              value={form.ownerName} onChange={set('ownerName')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@restaurant.com"
              value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Create a password"
              value={form.password} onChange={set('password')} minLength={6} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" placeholder="Phone number"
              value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label className="form-label">Address (optional)</label>
            <input className="form-input" placeholder="Restaurant address"
              value={form.address} onChange={set('address')} />
          </div>
          <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Restaurant Account'}
          </button>
        </form>
        <div className="login-hint">
          Already have an account? <Link to="/login" style={{ color: '#FF6B35', fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
