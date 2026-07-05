import React, { useState, useContext, useEffect } from 'react';
import md5 from 'md5';
import { ServerContext, MediatorContext } from '../../App';
import Sidebar from '../../components/Sidebar/Sidebar';

import "./Chats.css";

export default function Chats({ setPage, PAGES }) {

  const server = useContext(ServerContext);
  const mediator = useContext(MediatorContext);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    //
  }, []);

  return (
    <div className="chats-page">
        <Sidebar></Sidebar>
    </div>

  );
}