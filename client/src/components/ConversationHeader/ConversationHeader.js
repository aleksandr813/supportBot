import React, { useEffect, useState } from 'react';

import './ConversationHeader.css';

export default function ConversationHeader({
    conversationGuid,
    server,
    mediator,
}) {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        if (!mediator) return;

        const { GET_CONVERSATION_INFO } = mediator.getEventTypes();

        setInfo(null);

        const handleInfo = (data) => {
            setInfo(data);
        };

        mediator.subscribe(GET_CONVERSATION_INFO, handleInfo);

        server.getConversationInfo({ conversationGuid });

        return () => {
            mediator.unsubscribe(GET_CONVERSATION_INFO, handleInfo);
        }
    }, [mediator, server, conversationGuid]);

    return (
    <div className="conversation-header">
        <span className="conversation-header__username">{info?.username}</span>
        <span className="conversation-header__role">{info?.role}</span>
        <span className="conversation-header__phone">{info?.phone}</span>
    </div>
    );
}