import { io, Socket } from "socket.io-client";
import CONFIG from "../../config";

const { HOST } = CONFIG;
const { 
    LOGIN, 
    LOGOUT, 
    GET_CONVERSATIONS, 
    GET_CONVERSATION_MESSAGES, 
    GET_CONVERSATION_INFO, 
    SEND_MESSAGE, 
    NEW_MESSAGE,
    GET_BLOCKED_USERS,
    BLOCK_USER,
    GET_BOTS,
    ADD_BOT,
    UPDATE_BOT,
    DELETE_BOT
} = CONFIG.SOCKET;

class Server {
    constructor(mediator, store) {
        this.store = store;
        this.mediator = mediator;
        this.socket = io(HOST);
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on("connect", () => {
            console.log('connect');
        });

        this.socket.on(LOGIN, (data) => this.handleLogin(data));
        this.socket.on(GET_CONVERSATIONS, (data) => this.handleGetConversations(data));
        this.socket.on(GET_CONVERSATION_MESSAGES, (data) => this.handleGetConversationMessages(data));
        this.socket.on(GET_CONVERSATION_INFO, (data) => this.handleGetConversationInfo(data));
        this.socket.on(SEND_MESSAGE, (data) => this.handleSendMessage(data));
        this.socket.on(NEW_MESSAGE, (data) => this.handleNewMessage(data));
        this.socket.on(GET_BLOCKED_USERS, (data) => this.handleGetBlockedUsers(data));
        this.socket.on(BLOCK_USER, (data) => this.handleBlockUser(data));
        this.socket.on(GET_BOTS, (data) => this.handleGetBots(data));
        this.socket.on(ADD_BOT, (data) => this.handleAddBot(data));
        this.socket.on(UPDATE_BOT, (data) => this.handleUpdateBot(data));
        this.socket.on(DELETE_BOT, (data) => this.handleDeleteBot(data));
    }

    request(event, data = {}) {
        const _data = {
            ...this.store.getUserParams(),
            ...data,
        
        }
        this.socket.emit(event, _data);
    }

    login(data) {
        this.request(LOGIN, data);
    }

    logout() {
        this.request(LOGOUT, {});
    }

    getConversations(data) {
        this.request(GET_CONVERSATIONS, data);
    }

    getConversationMessages(data) {
        this.request(GET_CONVERSATION_MESSAGES, data);
    }

    getConversationInfo(data) {
        this.request(GET_CONVERSATION_INFO, data);
    }

    sendMessage(data) {
        this.request(SEND_MESSAGE, data);
    }

    getBlockedUsers(data = {}) {
        this.request(GET_BLOCKED_USERS, data);
    }

    blockUser(data) {
        this.request(BLOCK_USER, data);
    }

    getBots(data = {}) {
        this.request(GET_BOTS, data);
    }

    addBot(data) {
        this.request(ADD_BOT, data);
    }

    updateBot(data) {
        this.request(UPDATE_BOT, data);
    }

    deleteBot(data) {
        this.request(DELETE_BOT, data);
    }

    handleLogin(response) {
        const { guid, token } = response.data
        this.store.setUserParams(guid, token);
        this.mediator.call(LOGIN);
    }

    handleGetConversations(response) {
        this.mediator.call(GET_CONVERSATIONS, response.data);
    }

    handleGetConversationMessages(response) {
        this.mediator.call(GET_CONVERSATION_MESSAGES, response.data);
    }

    handleGetConversationInfo(response) {
        this.mediator.call(GET_CONVERSATION_INFO, response.data);
    }

    handleSendMessage(response) {
        this.mediator.call(SEND_MESSAGE, response.data);
    }

    handleNewMessage(response) {
        this.mediator.call(NEW_MESSAGE, response.data);
    }

    handleGetBlockedUsers(response) {
        this.mediator.call(GET_BLOCKED_USERS, response);
    }

    handleBlockUser(response) {
        this.mediator.call(BLOCK_USER, response);
    }

    handleGetBots(response) {
        this.mediator.call(GET_BOTS, response);
    }

    handleAddBot(response) {
        this.mediator.call(ADD_BOT, response);
    }

    handleUpdateBot(response) {
        this.mediator.call(UPDATE_BOT, response);
    }

    handleDeleteBot(response) {
        this.mediator.call(DELETE_BOT, response);
    }

}

export default Server;