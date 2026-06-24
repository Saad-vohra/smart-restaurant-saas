// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Sidebar from '../../components/shared/Sidebar';
// import WaiterTables from './WaiterTables';
// import WaiterOrders from './WaiterOrders';
// import WaiterBilling from './WaiterBilling';
// import { SocketProvider } from '../../context/SocketContext';
// import { useAuth } from '../../context/AuthContext';

// export default function WaiterLayout() {
//   const { user } = useAuth();
//   return (
//     <SocketProvider role="waiter">
//       <div className="app-layout">
//         <Sidebar role={user?.role === 'admin' ? 'admin' : 'waiter'} />
//         <div className="main-content">
//           <Routes>
//             <Route path="tables" element={<WaiterTables />} />
//             <Route path="orders" element={<WaiterOrders />} />
//             <Route path="billing" element={<WaiterBilling />} />
//             <Route path="*" element={<Navigate to="tables" />} />
//           </Routes>
//         </div>
//       </div>
//     </SocketProvider>
//   );
// }












import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import WaiterTables from './WaiterTables';
import WaiterOrders from './WaiterOrders';
import WaiterBilling from './WaiterBilling';
import { SocketProvider } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Mobile Bottom Navigation ─────────────────────────────────────────────── */
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const tabs = [
    { icon: '🪑', label: 'Tables', path: '/waiter/tables' },
    { icon: '📋', label: 'Orders', path: '/waiter/orders' },
    { icon: '💳', label: 'Billing', path: '/waiter/billing' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="waiter-bottom-nav">
      {tabs.map(tab => {
        const active = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
        return (
          <button
            key={tab.path}
            className={`bottom-nav-item${active ? ' active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        );
      })}
      <button className="bottom-nav-item" onClick={handleLogout} aria-label="Logout">
        <span className="bottom-nav-icon">🚪</span>
        <span className="bottom-nav-label">Logout</span>
      </button>
    </nav>
  );
}

/* ─── Mobile Top Bar (waiter-specific, no hamburger needed on mobile) ───────── */
function WaiterTopBar() {
  const location = useLocation();
  const { restaurant, user } = useAuth();

  const titleMap = {
    '/waiter/tables': '🪑 Tables',
    '/waiter/orders': '📋 My Orders',
    '/waiter/billing': '💳 Billing',
  };

  const currentTitle = Object.entries(titleMap).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || '🍽️ Waiter';

  return (
    <header className="waiter-topbar">
      <div className="waiter-topbar-brand">
        🍽️ {restaurant?.name || 'SRMS'}
      </div>
      <div className="waiter-topbar-center">{currentTitle}</div>
      <div className="waiter-topbar-user">
        <div className="waiter-topbar-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

/* ─── Layout ─────────────────────────────────────────────────────────────────── */
export default function WaiterLayout() {
  const { user } = useAuth();

  return (
    <SocketProvider role="waiter">
      {/* Desktop: uses existing sidebar layout */}
      <div className="app-layout waiter-layout">

        {/* Sidebar only shown on desktop via CSS */}
        <div className="waiter-sidebar-wrapper">
          <Sidebar role={user?.role === 'admin' ? 'admin' : 'waiter'} />
        </div>

        {/* Mobile top bar — hidden on desktop via CSS */}
        <WaiterTopBar />

        {/* Page content */}
        <div className="main-content waiter-main-content">
          <Routes>
            <Route path="tables" element={<WaiterTables />} />
            <Route path="orders" element={<WaiterOrders />} />
            <Route path="billing" element={<WaiterBilling />} />
            <Route path="*" element={<Navigate to="tables" />} />
          </Routes>
        </div>

        {/* Bottom nav — only shown on mobile via CSS */}
        <BottomNav />
      </div>
    </SocketProvider>
  );
}