import React from 'react';

const Page = ({ title, children }) => (
  <div className="fade-in" style={{ padding: '1rem' }}>
    <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
    <div className="glass-panel" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
      {children}
    </div>
  </div>
);

export const About = () => <Page title="About Prattle"><p>Prattle is built to reduce loneliness and foster genuine real-life connections in Indore.</p></Page>;
export const Guidelines = () => <Page title="Community Guidelines"><ul><li>Respect everyone.</li><li>No bullying or harassment.</li><li>Meet in public places safely.</li></ul></Page>;
export const Privacy = () => <Page title="Privacy Policy"><p>We collect minimal data. Chats are session-based and we prioritize an anonymous-first approach.</p></Page>;
