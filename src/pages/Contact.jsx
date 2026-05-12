import React, { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { db } from '../store/firebase';
import { ref, push, set } from 'firebase/database';

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const msgRef = push(ref(db, 'contact_messages'));
      await set(msgRef, {
        ...form,
        timestamp: Date.now()
      });
      setSent(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '0.5rem' }}>Contact Us</h2>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>We'd love to hear from you. Drop us a message!</p>

      {sent ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <CheckCircle size={56} color="#22c55e" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Message Sent!</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>We'll get back to you within 24 hours.</p>
          <button className="btn-outline" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
            Send Another
          </button>
        </div>
      ) : (
        <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your Name</label>
            <input required type="text" className="input-field" placeholder="What should we call you?"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</label>
            <input required type="email" className="input-field" placeholder="your@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subject</label>
            <input type="text" className="input-field" placeholder="What's this about?"
              value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Message</label>
            <textarea required className="input-field" rows={4} placeholder="Tell us what's on your mind..."
              value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Send size={16} /> Send Message
          </button>
        </form>
      )}

      {/* FAQ Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { q: 'Is it really anonymous?', a: 'Yes! We generate a random username for you. No personal data is collected unless you choose to share it.' },
            { q: 'Can I use Prattle outside Indore?', a: 'Currently Prattle is focused on Indore, but we plan to expand to more cities soon.' },
            { q: 'How do I report someone?', a: 'Use the Report button inside any 1:1 chat session. We take all reports seriously.' },
            { q: 'Is my chat data stored?', a: 'Chat messages are session-based and ephemeral. They are not permanently stored.' },
          ].map((faq, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}>{faq.q}</h4>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
