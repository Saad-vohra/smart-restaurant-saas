// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useSocket } from '../../context/SocketContext';

// const STATUS_COLORS = {
//   pending: 'badge-orange', accepted: 'badge-blue', preparing: 'badge-purple',
//   ready: 'badge-green', served: 'badge-green', completed: 'badge-gray', cancelled: 'badge-red'
// };

// export default function WaiterOrders() {
//   const [orders, setOrders] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const socket = useSocket();

//   const load = async () => {
//     const res = await axios.get('/api/orders?active=true');
//     setOrders(res.data);
//   };

//   useEffect(() => { load(); }, []);

//   useEffect(() => {
//     if (!socket) return;
//     socket.on('order-status-updated', (updated) => {
//       setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
//       if (selected?._id === updated._id) setSelected(updated);
//       if (updated.status === 'ready') {
//         toast.success(`🔔 Order #${updated.orderNumber} (T${updated.tableNumber}) is READY!`, { duration: 6000 });
//       }
//     });
//     return () => socket.off('order-status-updated');
//   }, [socket, selected]);

//   const markServed = async (id) => {
//     await axios.put(`/api/orders/${id}/status`, { status: 'served' });
//     toast.success('Order marked as served');
//     load();
//   };

//   const readyOrders = orders.filter(o => o.status === 'ready');
//   const activeOrders = orders.filter(o => o.status !== 'ready');

//   return (
//     <div>
//       <div className="page-header">
//         <h1>My Orders</h1>
//         <span className="text-sm text-muted">{orders.length} active orders</span>
//       </div>
//       <div className="page-body">

//         {readyOrders.length > 0 && (
//           <div style={{ background: '#f0fff4', border: '2px solid #68d391', borderRadius: 10, padding: 16, marginBottom: 24 }}>
//             <h3 style={{ fontFamily: 'Inter', fontWeight: 700, color: '#276749', marginBottom: 12, fontSize: '0.95rem' }}>
//               ✅ Ready to Serve ({readyOrders.length})
//             </h3>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//               {readyOrders.map(o => (
//                 <div key={o._id} style={{ background: 'white', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
//                   <div>
//                     <strong>Order #{o.orderNumber} — Table T{o.tableNumber}</strong>
//                     <div className="text-sm text-muted">{o.items.length} items • ₹{o.totalAmount}</div>
//                   </div>
//                   <button className="btn btn-success" onClick={() => markServed(o._id)}>Mark Served ✓</button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
//           <div>
//             {orders.length === 0 ? (
//               <div className="empty-state card"><div className="icon">📋</div><p>No active orders</p></div>
//             ) : (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                 {orders.map(o => (
//                   <div key={o._id}
//                     onClick={() => setSelected(selected?._id === o._id ? null : o)}
//                     style={{
//                       background: 'white', borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
//                       border: `2px solid ${selected?._id === o._id ? '#FF6B35' : '#E2E8F0'}`,
//                       boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s'
//                     }}>
//                     <div className="flex-between">
//                       <div>
//                         <strong style={{ fontSize: '0.95rem' }}>Order #{o.orderNumber}</strong>
//                         <span style={{ marginLeft: 10, fontSize: 13, color: '#718096' }}>Table T{o.tableNumber}</span>
//                       </div>
//                       <div className="flex-gap">
//                         <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
//                         <strong style={{ color: '#FF6B35' }}>₹{o.totalAmount}</strong>
//                       </div>
//                     </div>
//                     <div className="text-sm text-muted" style={{ marginTop: 6 }}>
//                       {o.items.map(i => `${i.name} ×${i.quantity}`).join(' • ')}
//                     </div>
//                     <div className="text-sm text-muted" style={{ marginTop: 4 }}>
//                       {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {selected && (
//             <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 80 }}>
//               <div className="flex-between" style={{ marginBottom: 16 }}>
//                 <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1rem' }}>Order #{selected.orderNumber}</h3>
//                 <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
//               </div>
//               <div style={{ marginBottom: 12 }}>
//                 <div className="flex-between text-sm" style={{ marginBottom: 6 }}><span className="text-muted">Table</span><strong>T{selected.tableNumber}</strong></div>
//                 <div className="flex-between text-sm" style={{ marginBottom: 6 }}><span className="text-muted">Customers</span><span>{selected.customerCount}</span></div>
//                 <div className="flex-between text-sm"><span className="text-muted">Status</span><span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span></div>
//               </div>
//               <hr style={{ borderColor: '#E2E8F0', margin: '14px 0' }} />
//               {selected.items.map((item, i) => (
//                 <div key={i} className="cart-item">
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
//                     {item.notes && <div style={{ fontSize: 11, color: '#FF6B35', fontStyle: 'italic' }}>📝 {item.notes}</div>}
//                   </div>
//                   <span style={{ fontSize: 13 }}>×{item.quantity}</span>
//                   <strong style={{ fontSize: 13, color: '#FF6B35' }}>₹{item.price * item.quantity}</strong>
//                 </div>
//               ))}
//               <hr style={{ borderColor: '#E2E8F0', margin: '14px 0' }} />
//               <div className="flex-between font-bold">
//                 <span>Total</span><span style={{ color: '#FF6B35', fontSize: '1.1rem' }}>₹{selected.totalAmount}</span>
//               </div>
//               {selected.status === 'ready' && (
//                 <button className="btn btn-success w-full mt-24" style={{ marginTop: 16 }} onClick={() => { markServed(selected._id); setSelected(null); }}>
//                   ✓ Mark as Served
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }















import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const STATUS_COLORS = {
  pending:   'badge-orange',
  accepted:  'badge-blue',
  preparing: 'badge-purple',
  ready:     'badge-green',
  served:    'badge-green',
  completed: 'badge-gray',
  cancelled: 'badge-red',
};

const STATUS_ICON = {
  pending:   '⏳',
  accepted:  '✅',
  preparing: '👨‍🍳',
  ready:     '🔔',
  served:    '🍽️',
  completed: '✓',
  cancelled: '✕',
};

export default function WaiterOrders() {
  const [orders, setOrders]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const load = async () => {
    try {
      const res = await axios.get('/api/orders?active=true');
      setOrders(res.data);
    } catch {
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('order-status-updated', (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      if (selected?._id === updated._id) setSelected(updated);
      if (updated.status === 'ready') {
        toast.success(`🔔 Order #${updated.orderNumber} (T${updated.tableNumber}) is READY!`, { duration: 6000 });
      }
    });
    return () => socket.off('order-status-updated');
  }, [socket, selected]);

  const markServed = async (id) => {
    try {
      await axios.put(`/api/orders/${id}/status`, { status: 'served' });
      toast.success('Order marked as served ✓');
      setSelected(null);
      load();
    } catch {
      toast.error('Could not update order');
    }
  };

  const readyOrders  = orders.filter(o => o.status === 'ready');
  const activeOrders = orders.filter(o => o.status !== 'ready');

  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <h1>My Orders</h1>
        <span className="text-sm text-muted">
          {orders.length} active
          {readyOrders.length > 0 && (
            <span className="wo-ready-pill">{readyOrders.length} ready!</span>
          )}
        </span>
      </div>

      <div className="page-body">

        {/* ── Loading ── */}
        {loading ? (
          <div className="empty-state card">
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p>Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">📋</div>
            <p>No active orders right now.</p>
            <p className="text-sm text-muted">Go to Tables to start a new order.</p>
          </div>
        ) : (
          <>
            {/* ── Ready to Serve banner ── */}
            {readyOrders.length > 0 && (
              <div className="wo-ready-banner">
                <div className="wo-ready-banner-title">
                  🔔 Ready to Serve — {readyOrders.length} order{readyOrders.length > 1 ? 's' : ''}
                </div>
                <div className="wo-ready-list">
                  {readyOrders.map(o => (
                    <div key={o._id} className="wo-ready-item">
                      <div className="wo-ready-item-info">
                        <span className="wo-order-num">#{o.orderNumber}</span>
                        <span className="wo-table-badge">T{o.tableNumber}</span>
                        <span className="text-sm text-muted">{o.items.length} items · ₹{o.totalAmount}</span>
                      </div>
                      <button
                        className="btn btn-success wo-serve-btn"
                        onClick={() => markServed(o._id)}
                      >
                        ✓ Served
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Order cards ── */}
            <div className="wo-order-list">
              {orders.map(o => (
                <div
                  key={o._id}
                  className={`wo-order-card${selected?._id === o._id ? ' selected' : ''}`}
                  onClick={() => setSelected(selected?._id === o._id ? null : o)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelected(selected?._id === o._id ? null : o)}
                  aria-expanded={selected?._id === o._id}
                >
                  {/* Card top row */}
                  <div className="wo-card-top">
                    <div className="wo-card-left">
                      <span className="wo-order-num">#{o.orderNumber}</span>
                      <span className="wo-table-badge">T{o.tableNumber}</span>
                    </div>
                    <div className="wo-card-right">
                      <span className={`badge ${STATUS_COLORS[o.status]}`}>
                        {STATUS_ICON[o.status]} {o.status}
                      </span>
                      <strong className="wo-amount">₹{o.totalAmount}</strong>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="wo-card-items">
                    {o.items.slice(0, 3).map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                    {o.items.length > 3 && ` +${o.items.length - 3} more`}
                  </div>

                  {/* Footer row */}
                  <div className="wo-card-footer">
                    <span className="text-sm text-muted">🕐 {fmt(o.createdAt)}</span>
                    {o.customerCount > 0 && (
                      <span className="text-sm text-muted">👥 {o.customerCount} guests</span>
                    )}
                    <span className="wo-expand-hint">
                      {selected?._id === o._id ? '▲ Less' : '▼ Details'}
                    </span>
                  </div>

                  {/* Expanded detail — inline on mobile */}
                  {selected?._id === o._id && (
                    <div className="wo-card-detail" onClick={e => e.stopPropagation()}>
                      <hr className="wo-detail-divider" />
                      <div className="wo-detail-meta">
                        <div className="wo-detail-row">
                          <span className="text-muted">Customers</span>
                          <span>{o.customerCount}</span>
                        </div>
                        <div className="wo-detail-row">
                          <span className="text-muted">Status</span>
                          <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                        </div>
                      </div>
                      <div className="wo-detail-items">
                        {o.items.map((item, i) => (
                          <div key={i} className="wo-detail-item">
                            <div className="wo-detail-item-name">
                              <span>{item.name}</span>
                              {item.notes && (
                                <span className="wo-item-note">📝 {item.notes}</span>
                              )}
                            </div>
                            <span className="wo-detail-item-qty">×{item.quantity}</span>
                            <strong className="wo-detail-item-price">₹{item.price * item.quantity}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="wo-detail-total">
                        <span>Total</span>
                        <strong>₹{o.totalAmount}</strong>
                      </div>
                      {o.status === 'ready' && (
                        <button
                          className="btn btn-success w-full wo-serve-big-btn"
                          onClick={() => markServed(o._id)}
                        >
                          ✓ Mark as Served
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}