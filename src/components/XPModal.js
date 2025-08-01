import React from 'react';

const XPModal = ({ xpGained, onClose }) => {
  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ color: '#FFDC00' }}>🎉 XP Gained!</h2>
        <p style={{ fontSize: '1.5rem' }}>+{xpGained} XP</p>
        <button onClick={onClose} style={button}>Close</button>
      </div>
    </div>
  );
};

const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modal = {
  background: '#001F3F',
  padding: 30,
  borderRadius: 12,
  color: '#fff',
  textAlign: 'center',
  boxShadow: '0 0 20px rgba(255, 220, 0, 0.5)',
  animation: 'fadeIn 0.4s ease-out',
};

const button = {
  marginTop: 20,
  padding: '10px 20px',
  backgroundColor: '#FFDC00',
  color: '#001F3F',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default XPModal;

