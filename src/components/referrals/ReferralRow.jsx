import React from 'react';

const ReferralRow = ({ item, onClaim }) => (
  <tr>
    <td>{item.user}</td>
    <td>{item.date}</td>
    <td>{item.status}</td>
    <td>
      <button
        className="btn-primary"
        disabled={item.status !== 'ready'}
        onClick={() => item.status === 'ready' && onClaim?.(item)}
        style={{ opacity: item.status === 'ready' ? 1 : 0.5 }}
      >
        Claim XP
      </button>
    </td>
  </tr>
);

export default ReferralRow;
