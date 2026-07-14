import React, { useState } from 'react';
import Login from './Login/Login';
import Chats from './Chats/Chats';
import Settings from './Settings/Settings';

import CONFIG from '../config';

export const PAGES = {
    LOGIN: 'LOGIN',
    CHATS: 'CHATS',
    CHAT: 'CHAT',
    SETTINGS: 'SETTINGS',
};

const PageManager = () => {
    const [page, setPage] = useState(PAGES.LOGIN);

    const props = {
        setPage,
        PAGES,
    };

    return (
        <>
            {page === PAGES.LOGIN && <Login {...props} />}
            {page === PAGES.CHATS && <Chats {...props} />}
            {page === PAGES.SETTINGS && <Settings {...props} />}
        </>
    );
};

export default PageManager;