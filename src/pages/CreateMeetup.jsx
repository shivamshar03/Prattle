import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CreateMeetup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', desc: '', date: '', time: '', location: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Meetup created successfully! (Mocked)');
    navigate('/meetups');
  };

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-dark)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate('/meetups')} />
        <h3 style={{ margin: 0 }}>Create Meetup</h3>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        <div className="glass-panel" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', borderColor: 'var(--secondary)', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary)' }}>Safety First</h4>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Always meet in public places. Do not share personal financial info. Trust your instincts.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Title</label>
            <input required type="text" className="input-field" placeholder="e.g. Coffee at Palasia" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description</label>
            <textarea required className="input-field" rows={3} placeholder="What's the plan?" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</label>
              <input required type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Time</label>
              <input required type="time" className="input-field" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Location</label>
            <input required type="text" className="input-field" placeholder="Exact public location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
            Publish Meetup
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetup;
