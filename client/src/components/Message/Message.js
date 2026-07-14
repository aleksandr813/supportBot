import React, { useState, useContext } from 'react';
import { FileServiceContext } from '../../App';

import './Message.css';

function formatTime(date) {
    const _date = new Date(date);

    const hours = String(_date.getHours()).padStart(2, '0');
    const minutes = String(_date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

export default function Message({ text, date, isOutgoing, status, attachmentUrl, attachmentType, attachmentName }) {
  const className = isOutgoing ? "message message--outgoing" : "message";
  const [mediaError, setMediaError] = useState(false);

  const fileService = useContext(FileServiceContext);
  const proxiedUrl = fileService.getProxiedUrl(attachmentUrl, attachmentType);

  return (
    <div className={className}>
      {attachmentUrl && (
        <div className="message__attachment">
          {attachmentType === 'image' && (
            !mediaError ? (
              <img 
                src={attachmentUrl} 
                alt={attachmentName || "image"} 
                className="message__img" 
                referrerPolicy="no-referrer"
                onError={() => setMediaError(true)}
              />
            ) : (
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="message__file-link">
                🖼️ Изображение (Скачать)
              </a>
            )
          )}
          {attachmentType === 'video' && (
            !mediaError ? (
              <video 
                src={proxiedUrl} 
                controls 
                className="message__video" 
                referrerPolicy="no-referrer"
                onError={() => setMediaError(true)}
              />
            ) : (
              <a href={proxiedUrl} target="_blank" rel="noopener noreferrer" className="message__file-link" download={attachmentName || "video.mp4"}>
                🎥 Видео (Скачать)
              </a>
            )
          )}
          {attachmentType !== 'image' && attachmentType !== 'video' && (
            <a href={proxiedUrl} target="_blank" rel="noopener noreferrer" className="message__file-link" download={attachmentName || "file"}>
              📁 {attachmentName || "Скачать файл"}
            </a>
          )}
        </div>
      )}
      {text && <span className="message__text">{text}</span>}
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