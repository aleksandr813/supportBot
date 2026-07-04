import { io, Socket } from "socket.io-client";
import CONFIG from "../../config";

const { HOST, SOCKET } = CONFIG;

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


            this.socket.on(SOCKET.LOGIN, (data) => this.handleLogin(data));
        });
    }

    request(event, data = {}) {
        const _data = {
            ...this.store.getUserParams(),
            ...this.data,
        
        }
        this.socket.emit(event, _data);
    }

    // SENDING METHODS

    login(data) {
        this.request(SOCKET.LOGIN, data);
    }


    //SOCKET HANDLERS

    handleLogin(data) {
        this.store.setUserParams(data.guid, data.token);
        this.mediator.call(LOGIN);
    }

}

export default Server;