import { io, Socket } from "socket.io-client";
import CONFIG from "../../config";

const { HOST } = CONFIG;
const { LOGIN, LOGOUT, GET_CONVERSATIONS, GET_CONVERSATION_MESSAGES, GET_CONVERSATION_INFO, SEND_MESSAGE } = CONFIG.SOCKET;

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

            this.socket.on(LOGIN, (data) => this.handleLogin(data));
            this.socket.on(GET_CONVERSATIONS, (data) => this.handleGetConversations(data));
            this.socket.on(GET_CONVERSATION_MESSAGES, (data) => this.handleGetConversationMessages(data));
            this.socket.on(GET_CONVERSATION_INFO, (data) => this.handleGetConversationInfo(data));
            this.socket.on(SEND_MESSAGE, (data) => this.handleSendMessage(data));
        });
    }

    request(event, data = {}) {
        const _data = {
            ...this.store.getUserParams(),
            ...data,
        
        }
        this.socket.emit(event, _data);
    }

    // SENDING METHODS

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


    //SOCKET HANDLERS

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

}

export default Server;