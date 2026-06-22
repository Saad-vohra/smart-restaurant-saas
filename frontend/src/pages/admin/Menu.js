import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Starters', 'Main Course', 'Drinks', 'Desserts', 'Fast Food', 'Special Items'];

const emptyForm = { name: '', category: 'Starters', price: '', description: '', available: true };

export default function Menu() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const load = async () => {
    const res = await axios.get('/api/menu');
    setItems(res.data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (item) => {
    setForm({ name: item.name, category: item.category, price: item.price, description: item.description, available: item.available });
    setEditId(item._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/menu/${editId}`, form);
        toast.success('Item updated');
      } else {
        await axios.post('/api/menu', form);
        toast.success('Item added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await axios.delete(`/api/menu/${id}`);
    toast.success('Item deleted');
    load();
  };

  const toggleAvail = async (item) => {
    await axios.put(`/api/menu/${item._id}`, { ...item, available: !item.available });
    toast.success('Availability updated');
    load();
  };

  const filtered = items.filter(i =>
    (activeCategory === 'All' || i.category === activeCategory) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const catColors = {
    'Starters': 'badge-orange', 'Main Course': 'badge-blue', 'Drinks': 'badge-green',
    'Desserts': 'badge-purple', 'Fast Food': 'badge-red', 'Special Items': 'badge-yellow'
  };

  return (
    <div>
      <div className="page-header">
        <h1>Menu Management</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>
      <div className="page-body">
        <div className="card mb-16">
          <div className="flex-gap">
            <input className="form-input" placeholder="Search items..." style={{ maxWidth: 260 }}
              value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
              {['All', ...CATEGORIES].map(cat => (
                <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(item => (
            <div key={item._id} className="card" style={{ opacity: item.available ? 1 : 0.6 }}>
              <div className="flex-between mb-16">
                <span className={`badge ${catColors[item.category] || 'badge-gray'}`}>{item.category}</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FF6B35' }}>₹{item.price}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontFamily: 'Inter', fontWeight: 700, marginBottom: 4 }}>{item.name}</h3>
              <p className="text-sm text-muted" style={{ marginBottom: 14 }}>{item.description}</p>
              <div className="flex-between">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={item.available} onChange={() => toggleAvail(item)} />
                  {item.available ? '✅ Available' : '❌ Unavailable'}
                </label>
                <div className="flex-gap">
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(item)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state"><div className="icon">🍽️</div><p>No menu items found</p></div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input className="form-input" placeholder="e.g. Paneer Tikka" required
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input className="form-input" type="number" placeholder="250" required
                      value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Short description..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    <input type="checkbox" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
                    Available for ordering
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
