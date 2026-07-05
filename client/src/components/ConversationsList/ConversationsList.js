import React from 'react';
import { useEffect } from "react";
import Conversation from '../Conversation/Conversation';

import './ConversationsList.css';

export default function ConversationsList({ conversations, onSelectConversation }) {

    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);

        return () => {
          container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
    <div className="conversations-list">
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
    </div>
    );
}