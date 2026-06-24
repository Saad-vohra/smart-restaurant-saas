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












import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import WaiterTables from './WaiterTables';
import WaiterOrders from './WaiterOrders';
import WaiterBilling from './WaiterBilling';
import { SocketProvider } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Mobile bottom navigation (waiter-only, hidden on desktop via CSS) ─── */
function WaiterBottomNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout } = useAuth();

  const tabs = [
    { icon: '🪑', label: 'Tables',   path: '/waiter/tables'  },
    { icon: '📋', label: 'Orders',   path: '/waiter/orders'  },
    { icon: '💳', label: 'Billing',  path: '/waiter/billing' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="waiter-bottom-nav" role="navigation" aria-label="Waiter navigation">
      {tabs.map(tab => {
        const active =
          location.pathname === tab.path ||
          location.pathname.startsWith(tab.path + '/');
        return (
          <button
            key={tab.path}
            className={`wbn-item${active ? ' wbn-active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="wbn-icon">{tab.icon}</span>
            <span className="wbn-label">{tab.label}</span>
            {active && <span className="wbn-indicator" />}
          </button>
        );
      })}

      {/* Logout button */}
      <button
        className="wbn-item wbn-logout"
        onClick={handleLogout}
        aria-label="Logout"
      >
        <span className="wbn-icon">🚪</span>
        <span className="wbn-label">Logout</span>
      </button>
    </nav>
  );
}

/* ─── Layout ─────────────────────────────────────────────────────────────── */
export default function WaiterLayout() {
  const { user } = useAuth();

  return (
    <SocketProvider role="waiter">
      <div className="app-layout">

        {/*
          Sidebar handles its own mobile-topbar (hamburger) internally.
          On desktop  → full 260px sidebar visible.
          On mobile   → sidebar slides in as drawer, hamburger in topbar.
        */}
        <Sidebar role={user?.role === 'admin' ? 'admin' : 'waiter'} />

        {/* Main page content */}
        <div className="main-content waiter-main">
          <Routes>
            <Route path="tables"  element={<WaiterTables />}  />
            <Route path="orders"  element={<WaiterOrders />}  />
            <Route path="billing" element={<WaiterBilling />} />
            <Route path="*"       element={<Navigate to="tables" />} />
          </Routes>
        </div>

        {/* Bottom nav — only rendered/visible on mobile via CSS */}
        <WaiterBottomNav />
      </div>
    </SocketProvider>
  );
}
