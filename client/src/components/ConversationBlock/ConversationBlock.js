import React, { useEffect, useRef, useState, useMemo, useLayoutEffect, useCallback, useContext } from 'react';
import Message from '../Message/Message';
import ConversationHeader from '../ConversationHeader/ConversationHeader';
import { FileServiceContext } from '../../App';

import './ConversationBlock.css';

function generateTempId() {
    return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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

    const fileInputRef = useRef(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [attachment, setAttachment] = useState(null);

    const fileService = useContext(FileServiceContext);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFile(true);

        try {
            const uploadedAttachment = await fileService.upload(file, conversationGuid);
            setAttachment(uploadedAttachment);
        } catch (err) {
            console.error('File upload failed:', err);
            alert(err.message || 'Ошибка сети при загрузке файла');
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const isLoadingRef = useRef(false);
    const cursorRef = useRef(null);
    const pendingHistoryScrollRef = useRef(false);

    const orderedMessages = useMemo(() => messages.slice().reverse(), [messages]);

    const loadMore = useCallback(() => {
        if (isLoadingRef.current || !hasMore) return;

        if (containerRef.current) {
            prevScrollHeightRef.current = containerRef.current.scrollHeight;
        }

        isLoadingRef.current = true;
        setIsLoading(true);

        server.getConversationMessages({
            conversationGuid,
            cursor: cursorRef.current,
            limit: 20,
        });
    }, [conversationGuid, hasMore]);

    useEffect(() => {
        if (!mediator) return;

        const { GET_CONVERSATION_MESSAGES, NEW_MESSAGE, SEND_MESSAGE } = mediator.getEventTypes();

        setMessages([]);
        setHasMore(true);
        cursorRef.current = null;
        prevScrollHeightRef.current = 0;
        pendingHistoryScrollRef.current = false;
        setAttachment(null);

        const handleHistory = (data) => {
            if (data.conversationGuid !== undefined && data.conversationGuid !== conversationGuid) return;

            pendingHistoryScrollRef.current = true;
            setMessages(prev => {
                const combined = [...prev, ...data.items];
                return Array.from(new Map(combined.map(item => [item.message_id, item])).values());
            });

            cursorRef.current = data.nextCursor;
            setHasMore(data.hasMore);
            setIsLoading(false);
            isLoadingRef.current = false;
        };

        const handleNewMessage = (data) => {
            if (data.conversationGuid !== conversationGuid) return;

            setMessages(prev => {
                if (prev.some(m => m.message_id === data.message.message_id)) return prev;

                if (data.tempId) {
                    const idx = prev.findIndex(m => m.message_id === data.tempId);
                    if (idx !== -1) {
                        const updated = [...prev];
                        updated[idx] = { ...data.message, status: 'sent' };
                        return updated;
                    }
                }

                return [data.message, ...prev];
            });
        };

        const handleSendAck = (data) => {
            const { tempId, success } = data || {};
            if (!tempId || success) return;

            setMessages(prev => prev.map(m => (
                m.message_id === tempId ? { ...m, status: 'error' } : m
            )));
        };

        mediator.subscribe(GET_CONVERSATION_MESSAGES, handleHistory);
        mediator.subscribe(NEW_MESSAGE, handleNewMessage);
        mediator.subscribe(SEND_MESSAGE, handleSendAck);

        setIsLoading(true);
        isLoadingRef.current = true;
        server.getConversationMessages({ conversationGuid, limit: 20 });

        return () => {
            mediator.unsubscribe(GET_CONVERSATION_MESSAGES, handleHistory);
            mediator.unsubscribe(NEW_MESSAGE, handleNewMessage);
            mediator.unsubscribe(SEND_MESSAGE, handleSendAck);
        };
    }, [conversationGuid]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollHeight <= container.clientHeight) return;
            if (container.scrollTop <= 50) loadMore();
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (pendingHistoryScrollRef.current) {
            container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
            prevScrollHeightRef.current = 0;
            pendingHistoryScrollRef.current = false;
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
        const text = messageText.trim();
        if (!text && !attachment) return;

        const tempId = generateTempId();

        const optimisticMessage = {
            message_id: tempId,
            text,
            date: new Date().toISOString(),
            sender: 'operator',
            status: 'sending',
            attachment_url: attachment ? attachment.localUrl : null,
            attachment_type: attachment ? attachment.type : null,
            attachment_name: attachment ? attachment.filename : null,
        };

        setMessages(prev => [optimisticMessage, ...prev]);
        setMessageText('');
        setAttachment(null);

        server.sendMessage({
            text,
            conversationGuid,
            tempId,
            attachments: attachment ? [attachment.request] : null
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
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

                {orderedMessages.map((msg) => (
                    <Message
                        key={msg.message_id}
                        text={msg.text}
                        date={msg.date}
                        isOutgoing={msg.sender === 'operator'}
                        status={msg.status}
                        attachmentUrl={msg.attachment_url}
                        attachmentType={msg.attachment_type}
                        attachmentName={msg.attachment_name}
                    />
                ))}
            </div>

            {attachment && (
                <div className="conversation-block__attachment-preview">
                    <span className="conversation-block__attachment-name">
                        📎 {attachment.filename} ({attachment.type === 'image' ? 'Фото' : attachment.type === 'video' ? 'Видео' : 'Документ'})
                    </span>
                    <button
                        type="button"
                        className="conversation-block__attachment-remove"
                        onClick={() => setAttachment(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="conversation-block__input-row">
                <button
                    type="button"
                    className="conversation-block__attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    title="Прикрепить файл"
                >
                    {uploadingFile ? '⏳' : '📎'}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <textarea
                    ref={textareaRef}
                    rows={1}
                    className="conversation-block__input"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
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