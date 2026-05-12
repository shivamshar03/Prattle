import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const CreateMeetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', desc: '', date: '', time: '', location: '' });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Always clear error for this field using functional update to avoid stale closure
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = 'Title is required';
    if (!form.desc?.trim()) errs.desc = 'Description is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.time) errs.time = 'Time is required';
    if (!form.location?.trim()) errs.location = 'Location is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newMeetup = {
      id: Date.now(),
      title: form.title,
      desc: form.desc,
      date: form.date,
      time: form.time,
      location: form.location,
      host: user.username,
      attendees: [user.username]
    };

    const existing = JSON.parse(localStorage.getItem('prattle_meetups') || '[]');
    existing.push(newMeetup);
    localStorage.setItem('prattle_meetups', JSON.stringify(existing));

    navigate('/meetups');
  };

  const fieldStyle = (name) => ({
    borderColor: errors[name] ? '#ef4444' : undefined
  });

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-dark)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate('/meetups')} />
        <h3 style={{ margin: 0 }}>Create Meetup</h3>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        <div className="glass-panel" style={{ backgroundColor: 'rgba(236, 72, 153, 0.08)', borderColor: 'rgba(236, 72, 153, 0.3)', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> Safety First
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <li>Always meet in public places</li>
            <li>Don't share personal financial info</li>
            <li>Tell a friend where you're going</li>
            <li>Trust your instincts</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Title *</label>
            <input type="text" className="input-field" placeholder="e.g. Coffee at Palasia" value={form.title} onChange={e => updateField('title', e.target.value)} style={fieldStyle('title')} />
            {errors.title && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.title}</p>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description *</label>
            <textarea className="input-field" rows={3} placeholder="What's the plan? Who should join?" value={form.desc} onChange={e => updateField('desc', e.target.value)} style={fieldStyle('desc')} />
            {errors.desc && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.desc}</p>}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date *</label>
              <input type="date" className="input-field" value={form.date} onChange={e => updateField('date', e.target.value)} style={fieldStyle('date')} />
              {errors.date && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.date}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Time *</label>
              <input type="time" className="input-field" value={form.time} onChange={e => updateField('time', e.target.value)} style={fieldStyle('time')} />
              {errors.time && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.time}</p>}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Location *</label>
            <input type="text" className="input-field" placeholder="Exact public location in Indore" value={form.location} onChange={e => updateField('location', e.target.value)} style={fieldStyle('location')} />
            {errors.location && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.location}</p>}
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1rem' }}>
            Publish Meetup
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetup;
