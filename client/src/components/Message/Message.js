import React from 'react';

import './Message.css';

function formatTime(date) {
    const _date = new Date(date);

    const hours = String(_date.getHours()).padStart(2, '0');
    const minutes = String(_date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

export default function Message({ text, date, isOutgoing }) {
  const className = isOutgoing ? "message message--outgoing" : "message";

  return (
    <div className={className}>
      <span className="message__text">{text}</span>
      <span className="message__date">{formatTime(date)}</span>
    </div>
  );
}