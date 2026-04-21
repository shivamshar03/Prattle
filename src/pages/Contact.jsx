import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const Contact = () => {
  const [sent, setSent] = useState(false);
  const handleSubmit = e => { e.preventDefault(); setSent(true); };
  return (
    <div className="fade-in" style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Contact Us</h2>
      {sent ? (
        <div className="glass-panel text-center">
          <Mail size={48} color="var(--primary)" style={{ margin: '1rem auto' }} />
          <h3>Message Sent!</h3>
          <p className="text-muted">We will get back to you soon.</p>
        </div>
      ) : (
        <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input required type="text" className="input-field" placeholder="Name" />
          <input required type="email" className="input-field" placeholder="Email" />
          <textarea required className="input-field" rows={4} placeholder="Your message..."></textarea>
          <button type="submit" className="btn-primary">Send Email</button>
        </form>
      )}
      <div style={{ marginTop: '2rem' }}>
        <h3>FAQ</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}><strong>Q: Is it really anonymous?</strong><br/>A: Yes, until you decide to share your real details.</p>
      </div>
    </div>
  );
};
export default Contact;
