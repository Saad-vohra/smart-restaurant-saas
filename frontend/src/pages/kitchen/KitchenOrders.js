import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const STATUS_FLOW = {
  pending: { next: 'accepted', label: 'Accept', color: '#3182ce', bg: '#ebf8ff', border: '#bee3f8' },
  accepted: { next: 'preparing', label: 'Start Preparing', color: '#805ad5', bg: '#faf5ff', border: '#d6bcfa' },
  preparing: { next: 'ready', label: 'Mark Ready', color: '#38a169', bg: '#f0fff4', border: '#9ae6b4' },
  ready: { next: 'served', label: 'Mark Served', color: '#276749', bg: '#c6f6d5', border: '#68d391' },
};

const STATUS_HEADER_BG = {
  pending: { bg: '#fffaf0', border: '#ED8936', text: '#c05621' },
  accepted: { bg: '#ebf8ff', border: '#3182ce', text: '#2c5282' },
  preparing: { bg: '#faf5ff', border: '#805ad5', text: '#553c9a' },
  ready: { bg: '#f0fff4', border: '#38a169', text: '#276749' },
};

function KitchenCard({ order, onStatusChange }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const created = new Date(order.createdAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - created) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order.createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isUrgent = elapsed > 900; // 15 min

  const headerStyle = STATUS_HEADER_BG[order.status] || STATUS_HEADER_BG.pending;
  const flow = STATUS_FLOW[order.status];

  return (
    <div className="kitchen-card" style={{
      background: 'white', borderRadius: 12, overflow: 'hidden',
      boxShadow: isUrgent ? '0 0 0 3px #FC8181, 0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.08)',
      border: `2px solid ${headerStyle.border}`, transition: 'all 0.3s'
    }}>
      <div style={{ padding: '12px 16px', background: headerStyle.bg, borderBottom: `2px solid ${headerStyle.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: headerStyle.text }}>
              🪑 Table T{order.tableNumber}
            </div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>Order #{order.orderNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: isUrgent ? '#e53e3e' : '#718096' }}>
              ⏱ {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <div style={{ fontSize: 10, marginTop: 2, color: headerStyle.text, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {order.status}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < order.items.length - 1 ? '1px solid #F7F8FA' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</span>
                {item.notes && (
                  <div style={{ fontSize: 12, color: '#FF6B35', fontStyle: 'italic', marginTop: 3, padding: '3px 8px', background: '#fff3ee', borderRadius: 4, display: 'inline-block' }}>
                    📝 {item.notes}
                  </div>
                )}
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FF6B35', marginLeft: 12, background: '#fff3ee', padding: '2px 10px', borderRadius: 20 }}>
                ×{item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {flow && (
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={() => onStatusChange(order._id, flow.next)}
            style={{
              width: '100%', padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13, color: 'white',
              background: flow.next === 'accepted' ? '#3182ce' : flow.next === 'preparing' ? '#805ad5' : flow.next === 'ready' ? '#38a169' : '#276749',
              transition: 'all 0.2s'
            }}>
            {flow.label} →
          </button>
        </div>
      )}
    </div>
  );
}

export default function KitchenOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const socket = useSocket();
  const audioRef = useRef(null);

  const load = async () => {
    const res = await axios.get('/api/orders?active=true');
    const active = res.data.filter(o => !['completed', 'cancelled', 'served'].includes(o.status));
    setOrders(active);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-order', (order) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`🔔 New order! Table T${order.tableNumber} — #${order.orderNumber}`, { duration: 8000 });
    });

    socket.on('order-updated', (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      toast('📝 Order updated', { icon: '✏️' });
    });

    socket.on('order-status-updated', (updated) => {
      if (['completed', 'cancelled', 'served'].includes(updated.status)) {
        setOrders(prev => prev.filter(o => o._id !== updated._id));
      } else {
        setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      }
    });

    return () => {
      socket.off('new-order');
      socket.off('order-updated');
      socket.off('order-status-updated');
    };
  }, [socket]);

  const updateStatus = async (id, status) => {
    await axios.put(`/api/orders/${id}/status`, { status });
    toast.success(`Status → ${status}`);
    load();
  };

  const STATUS_ORDER = ['pending', 'accepted', 'preparing', 'ready'];
  const filtered = filter === 'active'
    ? orders
    : orders.filter(o => o.status === filter);

  const byStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = filtered.filter(o => o.status === s);
    return acc;
  }, {});

  const counts = STATUS_ORDER.reduce((acc, s) => { acc[s] = orders.filter(o => o.status === s).length; return acc; }, {});

  return (
    <div>
      <div className="page-header" style={{ background: '#1A202C', color: 'white', borderBottom: '1px solid #2D3748' }}>
        <h1 style={{ color: 'white', fontFamily: 'Playfair Display', fontSize: '1.4rem' }}>
          👨‍🍳 Kitchen Display
        </h1>
        <div className="flex-gap">
          {[
            { key: 'active', label: `All Active (${orders.length})` },
            { key: 'pending', label: `Pending (${counts.pending})` },
            { key: 'accepted', label: `Accepted (${counts.accepted})` },
            { key: 'preparing', label: `Preparing (${counts.preparing})` },
            { key: 'ready', label: `Ready (${counts.ready})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`btn btn-sm ${filter === f.key ? 'btn-primary' : ''}`}
              style={{ color: filter === f.key ? 'white' : '#CBD5E0', background: filter === f.key ? '#FF6B35' : 'rgba(255,255,255,0.08)', border: 'none', fontSize: 12 }}>
              {f.label}
            </button>
          ))}
          <button className="btn btn-sm" onClick={load} style={{ background: 'rgba(255,255,255,0.1)', color: '#CBD5E0', border: 'none' }}>🔄</button>
        </div>
      </div>

      <div style={{ padding: 20, background: '#F7F8FA', minHeight: 'calc(100vh - 70px)' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#718096' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 700 }}>No Active Orders</h2>
            <p style={{ marginTop: 8 }}>Waiting for new orders from waiters...</p>
          </div>
        ) : filter === 'active' ? (
          // Show by status columns
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {STATUS_ORDER.map(status =>
              byStatus[status].map(order => (
                <KitchenCard key={order._id} order={order} onStatusChange={updateStatus} />
              ))
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(order => (
              <KitchenCard key={order._id} order={order} onStatusChange={updateStatus} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#718096' }}>
                No orders with status: {filter}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
