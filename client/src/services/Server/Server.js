import { io, Socket } from "socket.io-client";
import CONFIG from "../../config";

const { HOST } = CONFIG;
const { LOGIN, GET_CONVERSATIONS } = CONFIG.SOCKET;

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

    getConversations(data) {
        this.request(GET_CONVERSATIONS, data);
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

}

export default Server;