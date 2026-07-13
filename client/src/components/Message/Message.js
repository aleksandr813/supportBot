import React from 'react';

import './Message.css';

function formatTime(date) {
    const _date = new Date(date);

    const hours = String(_date.getHours()).padStart(2, '0');
    const minutes = String(_date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

export default function Message({ text, date, isOutgoing, status }) {
  const className = isOutgoing ? "message message--outgoing" : "message";

  return (
    <div className={className}>
      <span className="message__text">{text}</span>
      <span className="message__footer">
        {status === 'sending' && (
          <span
            className="message__status message__status--sending"
            title="Отправляется..."
          >
            ⏳
          </span>
        )}
        {status === 'error' && (
          <span
            className="message__status message__status--error"
            title="Сообщение не отправлено"
          >
            ❗
          </span>
        )}
        <span className="message__date">{formatTime(date)}</span>
      </span>
    </div>
  );
}