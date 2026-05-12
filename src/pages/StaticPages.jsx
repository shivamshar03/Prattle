import React from 'react';
import { Shield, Eye, Users, Heart, AlertTriangle, Lock } from 'lucide-react';

const Page = ({ title, icon, children }) => (
  <div className="fade-in">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
      {icon}
      <h2 style={{ margin: 0 }}>{title}</h2>
    </div>
    {children}
  </div>
);

export const About = () => (
  <Page title="About Prattle" icon={<Heart size={28} color="var(--secondary)" />}>
    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>Our Mission</h3>
      <p style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1rem' }}>
        Prattle was born out of a simple idea — people in Indore want to connect, but don't always know how to start.
        We bridge the gap between anonymous online interactions and genuine real-life friendships.
      </p>
      <p style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
        Our journey: <strong>Anonymous Chat → Trust → Community → Meetup → Real-Life Connection</strong>
      </p>
    </div>

    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>How It Works</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { step: '1', title: 'Generate Identity', desc: 'Get a random anonymous name. No sign-up, no personal data.' },
          { step: '2', title: 'Match & Chat', desc: 'Find random people or join community channels. 15-min timed sessions build trust.' },
          { step: '3', title: 'Build Circles', desc: 'Add people you vibe with to your private circle for continued conversations.' },
          { step: '4', title: 'Meet IRL', desc: 'Join public meetups to take your connections offline, safely.' },
        ].map(item => (
          <div key={item.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: '700', color: 'white'
            }}>{item.step}</div>
            <div>
              <h4 style={{ margin: '0 0 0.15rem 0' }}>{item.title}</h4>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Built for Indore 🏙️</h3>
      <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
        Prattle is hyper-local. We're focused on making meaningful connections happen in Indore — from Palasia coffee shops to Rajwada evening walks.
        Because the best connections happen when you can actually meet the person.
      </p>
    </div>

    <div className="glass-panel" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
      <h3 style={{ marginBottom: '0.75rem', color: '#22c55e' }}>Join Our Community 🌟</h3>
      <p style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1rem', color: 'var(--text-main)' }}>
        Want to stay updated, connect with other members, and be part of the core Prattle family? Join our official WhatsApp group!
      </p>
      <a href="https://chat.whatsapp.com/FIRhaIZX3EBEs07pLkbC4N" target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-block', backgroundColor: '#25D366', color: 'white', textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
        Join WhatsApp Group
      </a>
    </div>
  </Page>
);

export const Guidelines = () => (
  <Page title="Community Guidelines" icon={<Shield size={28} color="var(--primary)" />}>
    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
        Prattle is built on trust and respect. Following these guidelines ensures everyone has a safe and enjoyable experience.
      </p>
    </div>

    {[
      { icon: <Users size={20} color="var(--primary)" />, title: 'Be Respectful', items: ['Treat everyone with kindness and dignity', 'Respect different opinions and backgrounds', 'Don\'t use slurs, hate speech, or discriminatory language'] },
      { icon: <Shield size={20} color="#22c55e" />, title: 'Stay Safe', items: ['Never share personal financial information', 'Always meet in public, well-lit places', 'Tell someone you trust where you\'re going for meetups', 'Trust your instincts — if something feels off, leave'] },
      { icon: <AlertTriangle size={20} color="var(--secondary)" />, title: 'Zero Tolerance', items: ['No harassment, bullying, or threats', 'No spam or unsolicited advertising', 'No impersonation or catfishing', 'No sharing of explicit or illegal content'] },
      { icon: <Eye size={20} color="#f59e0b" />, title: 'Reporting', items: ['Use the Report button in any chat to flag issues', 'All reports are reviewed within 24 hours', 'Repeated violations lead to permanent bans', 'False reports may also result in action'] },
    ].map((section, i) => (
      <div key={i} className="glass-panel" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {section.icon}
          <h3 style={{ margin: 0 }}>{section.title}</h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '2' }}>
          {section.items.map((item, j) => <li key={j}>{item}</li>)}
        </ul>
      </div>
    ))}
  </Page>
);

export const Privacy = () => (
  <Page title="Privacy Policy" icon={<Lock size={28} color="var(--primary)" />}>
    {[
      { title: 'What We Collect', content: 'Prattle collects minimal data. Your anonymous username, selected vibes, and session-based chat messages. We do not require email, phone number, or any real identity information to use the platform.' },
      { title: 'Chat Data', content: 'Messages in 1:1 chats are session-based and ephemeral. They are tied to the session duration (15 minutes) and are not permanently archived. Channel messages may persist for the duration of the session for all participants.' },
      { title: 'Local Storage', content: 'We use your browser\'s localStorage to persist your anonymous identity and circles across sessions. This data never leaves your device unless you interact with our real-time services.' },
      { title: 'Firebase Services', content: 'We use Firebase Realtime Database for live messaging, presence tracking, and matchmaking. Data transmitted through Firebase is encrypted in transit. We do not sell or share any data with third parties.' },
      { title: 'Cookies', content: 'Prattle does not use tracking cookies. We do not run any third-party analytics or advertising scripts.' },
      { title: 'Your Rights', content: 'You can delete all your data at any time by clicking "Leave Identity" in your profile. This removes all locally stored data. To request deletion of any server-side data, contact us through the Contact page.' },
    ].map((section, i) => (
      <div key={i} className="glass-panel" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--primary)' }}>{section.title}</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>{section.content}</p>
      </div>
    ))}

    <div className="glass-panel" style={{ backgroundColor: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' }}>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Last updated: May 2026 • Questions? <a href="/contact" style={{ color: 'var(--primary)' }}>Contact us</a>
      </p>
    </div>
  </Page>
);
