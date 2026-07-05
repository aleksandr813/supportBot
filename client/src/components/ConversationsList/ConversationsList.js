import React, { useEffect, useRef } from 'react';
import Conversation from '../Conversation/Conversation';

import './ConversationsList.css';

export default function ConversationsList({ 
    conversations, 
    onSelectConversation, 
    onLoadMore, 
    isLoading, 
    hasMore 
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) {
                onLoadMore();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
          container.removeEventListener('scroll', handleScroll);
        };
    }, [onLoadMore]);

    return (
    <div className="conversations-list" ref={containerRef}>
        {conversations.map((conv) => (
            <Conversation
                key={conv.conversation_guid}
                username={conv.username}
                role={conv.role}
                lastMessageDate={conv.last_date}
                messageText={conv.last_message}
                onClick={() => onSelectConversation(conv.conversation_guid)}
            />
        ))}

        {isLoading && (
            <div className="conversations-list__status conversations-list__status--loading">
                Загрузка...
            </div>
        )}
        {!hasMore && conversations.length > 0 && (
            <div className="conversations-list__status conversations-list__status--end">
                Больше нет диалогов
            </div>
        )}
    </div>
    );
}