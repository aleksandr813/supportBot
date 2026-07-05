import React from 'react';
import './Conversation.css';

function formatDate(date) {
    return '2-12-2026'
}

export default function Conversation({ username, role, lastMessageDate, messageText, onClick }) {
  return (
    <button type="button" className="conversation" onClick={onClick}>
      <span className="conversation__top-row">
        <span className="conversation__username">{username}</span>
        <span className="conversation__date">{formatDate(lastMessageDate)}</span>
      </span>

      <span className="conversation__role">{role}</span>

      <span className="conversation__message">{messageText}</span>
    </button>
  );
}