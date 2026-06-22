import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import OrderModal from './OrderModal';

export default function WaiterTables() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [pendingTable, setPendingTable] = useState(null);
  const [customerCount, setCustomerCount] = useState(2);
  const socket = useSocket();

  const load = async () => {
    const res = await axios.get('/api/tables');
    setTables(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('table-updated', load);
    return () => socket.off('table-updated', load);
  }, [socket]);

  const handleTableClick = (table) => {
    if (table.status === 'occupied') {
      setSelectedTable(table);
      setShowOrderModal(true);
    } else if (table.status === 'available') {
      setPendingTable(table);
      setCustomerCount(2);
      setShowCustomerModal(true);
    }
  };

  const startOrder = () => {
    setSelectedTable({ ...pendingTable, customerCount });
    setShowCustomerModal(false);
    setShowOrderModal(true);
  };

  const available = tables.filter(t => t.status === 'available').length;
  const occupied = tables.filter(t => t.status === 'occupied').length;

  return (
    <div>
      <div className="page-header">
        <h1>Tables</h1>
        <div className="flex-gap">
          <span style={{ fontSize: 13, color: '#718096' }}>
            <span style={{ color: '#38a169', fontWeight: 700 }}>●</span> {available} Available &nbsp;
            <span style={{ color: '#FF6B35', fontWeight: 700 }}>●</span> {occupied} Occupied
          </span>
        </div>
      </div>
      <div className="page-body">
        <div className="card mb-16" style={{ padding: '12px 20px' }}>
          <p className="text-sm text-muted">Click on a <strong style={{ color: '#38a169' }}>green</strong> table to start a new order. Click on an <strong style={{ color: '#FF6B35' }}>orange</strong> table to add items to existing order.</p>
        </div>

        <div className="table-grid">
          {tables.map(t => (
            <div key={t._id} className={`table-card ${t.status}`} onClick={() => handleTableClick(t)}
              style={{ cursor: t.status === 'reserved' ? 'not-allowed' : 'pointer' }}>
              <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>TABLE</div>
              <div className="table-number">T{t.tableNumber}</div>
              <div style={{ fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                <span className={`table-status-dot dot-${t.status === 'available' ? 'green' : t.status === 'occupied' ? 'red' : 'yellow'}`}></span>
                <span style={{ color: t.status === 'available' ? '#276749' : t.status === 'occupied' ? '#c05621' : '#744210' }}>
                  {t.status}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>Cap: {t.capacity}</div>
              {t.status === 'occupied' && t.customerCount > 0 && (
                <div style={{ fontSize: 11, marginTop: 4, color: '#718096' }}>👥 {t.customerCount} guests</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Customer count modal */}
      {showCustomerModal && pendingTable && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start Order — Table T{pendingTable.tableNumber}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCustomerModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Number of Customers</label>
                <div className="flex-gap" style={{ justifyContent: 'center', margin: '12px 0' }}>
                  <button className="qty-btn" style={{ width: 36, height: 36 }} onClick={() => setCustomerCount(c => Math.max(1, c - 1))}>−</button>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{customerCount}</span>
                  <button className="qty-btn" style={{ width: 36, height: 36 }} onClick={() => setCustomerCount(c => Math.min(pendingTable.capacity, c + 1))}>+</button>
                </div>
                <p className="text-sm text-muted text-center">Max capacity: {pendingTable.capacity}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCustomerModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-lg" onClick={startOrder}>Start Order →</button>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => { setShowOrderModal(false); setSelectedTable(null); }}
          onSuccess={() => { setShowOrderModal(false); setSelectedTable(null); load(); }}
        />
      )}
    </div>
  );
}
