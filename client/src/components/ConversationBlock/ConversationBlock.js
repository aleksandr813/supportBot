import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import Message from '../Message/Message';
import ConversationHeader from '../ConversationHeader/ConversationHeader';

import './ConversationBlock.css';

export default function ConversationBlock({
    conversationGuid,
    server,
    mediator,
}) {
    const containerRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const textareaRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [messageText, setMessageText] = useState('');

    const isLoadingRef = useRef(false);
    const cursorRef = useRef(null);

    const loadMore = (cursor, currentHasMore, currentGuid) => {
        if (isLoadingRef.current || !currentHasMore) return;

        const container = containerRef.current;
        if (container) prevScrollHeightRef.current = container.scrollHeight;

        isLoadingRef.current = true;
        setIsLoading(true);

        server.getConversationMessages({ 
            conversationGuid: currentGuid, 
            cursor, 
            limit: 20 
        });
    };

    useEffect(() => {
        if (!mediator) return;

        const { GET_CONVERSATION_MESSAGES } = mediator.getEventTypes();

        setMessages([]);
        setHasMore(true);
        cursorRef.current = null;
        prevScrollHeightRef.current = 0;

        const handleMessages = (data) => {
            if (data.conversationGuid !== undefined && data.conversationGuid !== conversationGuid) return;

            setMessages(prev => {
                const isFirstLoad = prev.length === 0;
                const combined = isFirstLoad ? data.items : [...prev, ...data.items];

                const uniqueMessages = Array.from(
                    new Map(combined.map(item => [item.message_id, item])).values()
                );

                return uniqueMessages;
            });

            cursorRef.current = data.nextCursor;
            setHasMore(data.hasMore);

            setIsLoading(false);
            isLoadingRef.current = false;
        };

        mediator.subscribe(GET_CONVERSATION_MESSAGES, handleMessages);

        setIsLoading(true);
        isLoadingRef.current = true;
        server.getConversationMessages({ conversationGuid, limit: 20 });

        return () => {
            mediator.unsubscribe(GET_CONVERSATION_MESSAGES, handleMessages);
        };
    }, [conversationGuid]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollHeight <= container.clientHeight) return;
            if (container.scrollTop <= 50) {
                loadMore(cursorRef.current, hasMore, conversationGuid);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []); 

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (prevScrollHeightRef.current) {
            container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
            prevScrollHeightRef.current = 0;
        } else {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [messageText]);

    const handleSend = () => {
        server.sendMessage(messageText, )
        setMessageText('');
    };

    return (
        <div className="conversation-block">
            <ConversationHeader
                conversationGuid={conversationGuid}
                server={server}
                mediator={mediator}
            />

            <div className="conversation-block__messages" ref={containerRef}>
                {!hasMore && messages.length > 0 && (
                    <div className="conversation-block__status conversation-block__status--end">
                        Начало диалога
                    </div>
                )}
                {isLoading && (
                    <div className="conversation-block__status conversation-block__status--loading">
                        Загрузка...
                    </div>
                )}

                {messages.slice().reverse().map((msg) => (
                    <Message
                        key={msg.message_id}
                        text={msg.text}
                        date={msg.date}
                        isOutgoing={msg.external_id === null}
                    />
                ))}
            </div>

            <div className="conversation-block__input-row">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    className="conversation-block__input"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Введите сообщение..."
                />
                <button
                    type="button"
                    className="conversation-block__send"
                    onClick={handleSend}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
}