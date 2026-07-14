import React from 'react';

import './ConversationHeader.css';

export default function ConversationHeader({ info, onToggleBlock }) {
    return (
        <div className="conversation-header">
            <div className="conversation-header__details">
                <span className="conversation-header__username">{info?.username}</span>
                <span className="conversation-header__role">{info?.role}</span>
                <span className="conversation-header__phone">{info?.phone}</span>
            </div>
            {info && (
                <button
                    className={`conversation-header__block-btn ${info.is_blocked ? 'conversation-header__block-btn--blocked' : ''}`}
                    onClick={() => onToggleBlock?.(info.externalId, info.botGuid, !info.is_blocked)}
                >
                    {info.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                </button>
            )}
        </div>
    );
}