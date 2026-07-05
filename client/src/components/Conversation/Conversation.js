import React from 'react';

import './Conversation.css';

function formatDate(date) {
    const _date = new Date(date);

    const day = _date.getDate();
    const month = _date.getMonth() + 1;
    const year = _date.getFullYear();

    const hours = String(_date.getHours()).padStart(2, '0');
    const minutes = String(_date.getMinutes()).padStart(2, '0');

    const result = `${day}-${month}-${year} ${hours}:${minutes}`;
    return result;
}

function getTextPreview(messageText) {
    if (!messageText) return;
    if (messageText.length <= 20) return messageText;
    const textPreview = messageText.slice(0, 20) + "...";
    return textPreview;
}

export default function Conversation({ username, role, lastMessageDate, messageText, onClick }) {
  return (
    <button type="button" className="conversation" onClick={onClick}>
      <span className="conversation__top-row">
        <span className="conversation__username">{username}</span>
        <span className="conversation__date">{formatDate(lastMessageDate)}</span>
      </span>

      <span className="conversation__role">{role}</span>

      <span className="conversation__message">{getTextPreview(messageText)}</span>
    </button>
  );
}