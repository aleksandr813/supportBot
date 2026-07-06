import React, { useContext } from 'react';
import md5 from 'md5';
import { ServerContext, MediatorContext } from '../../App';
import Sidebar from '../../components/Sidebar/Sidebar';
import ConversationsList from '../../components/ConversationsList/ConversationsList';

import "./Chats.css";

export default function Chats({ setPage, PAGES }) {
  const server = useContext(ServerContext);
  const mediator = useContext(MediatorContext);

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
            server={server}
            mediator={mediator}
            onSelectConversation={handleSelectConversation}
        />
    </div>
  );
}