import React, { useState, useContext, useEffect } from 'react';
import md5 from 'md5';
import { ServerContext, MediatorContext } from '../../App';
import Sidebar from '../../components/Sidebar/Sidebar';
import ConversationsList from '../../components/ConversationsList/ConversationsList';

import "./Chats.css";

export default function Chats({ setPage, PAGES }) {

  const server = useContext(ServerContext);
  const mediator = useContext(MediatorContext);

  const [conversations, setConversations] = useState([]);

  const handleConversations = (data) => {
    setConversations(data.items);
  }

  const handleSelectConversation = (conversationGuid) => {
    setPage(PAGES.CHAT);
  }

  useEffect(() => {
    if (!mediator) return;
    const { GET_CONVERSATIONS } = mediator.getEventTypes();
    mediator.subscribe(GET_CONVERSATIONS, handleConversations);

    server.getConversations();

    return () => {
        mediator.unsubscribe(GET_CONVERSATIONS, handleConversations);
    }
  }, []);

  const handleNavigate = (key) => {
    if (key === "chats") {
      setPage(PAGES.CHATS);
    } else if (key === "settings") {
      setPage(PAGES.SETTINGS);
    }
  };

  const handleLogout = () => {
    setPage(PAGES.LOGIN);
  };

  return (
    <div className="chats-block">
        <Sidebar onNavigate={handleNavigate} onLogout={handleLogout} />
        <ConversationsList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
        />
    </div>

  );
}