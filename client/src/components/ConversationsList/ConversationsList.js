import React from 'react';
import Conversation from '../Conversation/Conversation';

import './ConversationsList.css';

export default function ConversationsList({ conversations, onSelectConversation }) {

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