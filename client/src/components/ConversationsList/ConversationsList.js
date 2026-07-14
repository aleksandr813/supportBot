import React, { useEffect, useRef, useState, useCallback } from 'react';
import Conversation from '../Conversation/Conversation';

import './ConversationsList.css';

export default function ConversationsList({
    server,
    mediator,
    onSelectConversation,
}) {
    const containerRef = useRef(null);

    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const isLoadingRef = useRef(false);
    const cursorRef = useRef(null);

    const requestCursorRef = useRef(null);

    const loadMore = useCallback(() => {
        if (isLoadingRef.current || !hasMore) return;

        requestCursorRef.current = cursorRef.current;
        isLoadingRef.current = true;
        setIsLoading(true);

        server.getConversations({ cursor: cursorRef.current, limit: 20 });
    }, [hasMore]);

    const refreshLatest = useCallback(() => {
        if (isLoadingRef.current) return;

        requestCursorRef.current = null;
        isLoadingRef.current = true;
        setIsLoading(true);

        server.getConversations({ limit: 20 });
    }, []);

    useEffect(() => {
        if (!mediator) return;

        const { GET_CONVERSATIONS } = mediator.getEventTypes();

        const handleConversations = (data) => {
            setConversations(prev => {
                const isFirstPage = requestCursorRef.current === null;
                const combined = isFirstPage ? [...data.items, ...prev] : [...prev, ...data.items];

                return Array.from(
                    new Map(combined.map(item => [item.conversation_guid, item])).values()
                );
            });

            cursorRef.current = data.nextCursor;
            setHasMore(data.hasMore);

            setIsLoading(false);
            isLoadingRef.current = false;
        };

        mediator.subscribe(GET_CONVERSATIONS, handleConversations);

        requestCursorRef.current = null;
        isLoadingRef.current = true;
        setIsLoading(true);
        server.getConversations({ limit: 20 });

        return () => mediator.unsubscribe(GET_CONVERSATIONS, handleConversations);
    }, []);

    useEffect(() => {
        if (!mediator) return;
        const { NEW_MESSAGE } = mediator.getEventTypes();

        const handleNewMessage = (data) => {
            setConversations(prev => {
                const idx = prev.findIndex(c => c.conversation_guid === data.conversationGuid);

                if (idx === -1) {
                    refreshLatest();
                    return prev;
                }

                let lastMessageText = data.message.text;
                if (!lastMessageText && (data.message.attachment_type || data.message.attachment_url)) {
                    const type = data.message.attachment_type;
                    if (type === 'image') {
                        lastMessageText = '📷 Фото';
                    } else if (type === 'video') {
                        lastMessageText = '🎥 Видео';
                    } else {
                        lastMessageText = '📁 Файл';
                    }
                }

                const updated = {
                    ...prev[idx],
                    last_message: lastMessageText,
                    last_date: data.message.date,
                };

                const rest = prev.filter((_, i) => i !== idx);
                return [updated, ...rest];
            });
        };

        mediator.subscribe(NEW_MESSAGE, handleNewMessage);
        return () => mediator.unsubscribe(NEW_MESSAGE, handleNewMessage);
    }, [refreshLatest]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) {
                loadMore();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
          container.removeEventListener('scroll', handleScroll);
        };
    }, [loadMore]);

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