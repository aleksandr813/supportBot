import React, { useState } from 'react';
import Login from './Login/Login';

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
    };

    return (
        <>
            {page === PAGES.LOGIN && <Login {...props} />}
        </>
    );
};

export default PageManager;