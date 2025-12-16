import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
            position: 'fixed',
        top: 20,
        right: 20,
        background: '#333',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: 4,
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        zIndex: 1000,
