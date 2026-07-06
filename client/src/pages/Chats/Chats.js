import React, { useContext, useState } from 'react';
import md5 from 'md5';
import { ServerContext, MediatorContext } from '../../App';
import Sidebar from '../../components/Sidebar/Sidebar';
import ConversationsList from '../../components/ConversationsList/ConversationsList';
import ConversationBlock from '../../components/ConversationBlock/ConversationBlock';

import "./Chats.css";

export default function Chats({ setPage, PAGES }) {
  const server = useContext(ServerContext);
  const mediator = useContext(MediatorContext);

  const [selectedConversationGuid, setSelectedConversationGuid] = useState(null);

  const handleSelectConversation = (conversationGuid) => {
    setSelectedConversationGuid(conversationGuid);
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
        {selectedConversationGuid && (
            <ConversationBlock
                conversationGuid={selectedConversationGuid}
                server={server}
                mediator={mediator}
            />
        )}
    </div>
  );
}