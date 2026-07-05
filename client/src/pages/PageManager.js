import React, { useState } from 'react';
import Login from './Login/Login';
import Chats from './Chats/Chats';

import CONFIG from '../config';

export const PAGES = {
    LOGIN: 'LOGIN',
    CHATS: 'CHATS',
    CHAT: 'CHAT',
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
        </>
    );
};

export default PageManager;