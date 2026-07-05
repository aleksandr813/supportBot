import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import md5 from 'md5';
import { ServerContext, MediatorContext } from '../../App';
import Sidebar from '../../components/Sidebar/Sidebar';
import ConversationsList from '../../components/ConversationsList/ConversationsList';

import "./Chats.css";

export default function Chats({ setPage, PAGES }) {
  const server = useContext(ServerContext);
  const mediator = useContext(MediatorContext);

  const [conversations, setConversations] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    if (!mediator) return;
    
    const { GET_CONVERSATIONS } = mediator.getEventTypes();

    const handleConversations = (data) => {
        setConversations(prev => {
            const isFirstLoad = prev.length === 0;
            const combined = isFirstLoad ? data.items : [...prev, ...data.items];
            
            const uniqueConversations = Array.from(
            new Map(combined.map(item => [item.conversation_guid, item])).values()
            );
            
            return uniqueConversations;
        });
        
        cursorRef.current = data.nextCursor;
        setHasMore(data.hasMore);
        
        setIsLoading(false);
        isLoadingRef.current = false;
    };

    mediator.subscribe(GET_CONVERSATIONS, handleConversations);

    setIsLoading(true);
    isLoadingRef.current = true;
    server.getConversations({ limit: 20 });

    return () => {
        mediator.unsubscribe(GET_CONVERSATIONS, handleConversations);
    }
  }, []); 

  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMore) return;
    
    isLoadingRef.current = true; 
    setIsLoading(true);
    
    server.getConversations({ cursor: cursorRef.current, limit: 20 });
  }, [hasMore]); 

  const handleSelectConversation = (conversationGuid) => {
    setPage(PAGES.CHAT);
  }

  const handleNavigate = (key) => {
    if (key === "chats") {
      setPage(PAGES.CHATS);
    } else if (key === "settings") {
      setPage(PAGES.SETTINGS);
    }
  };

  const handleLogout = () => {
    server.logout();
    setPage(PAGES.LOGIN);
  };

  return (
    <div className="chats-block">
        <Sidebar onNavigate={handleNavigate} onLogout={handleLogout} />
        <ConversationsList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            onLoadMore={loadMore}
            isLoading={isLoading}
            hasMore={hasMore}
        />
    </div>
  );
}