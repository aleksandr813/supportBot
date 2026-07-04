import { io, Socket } from "socket.io-client";

const { HOST } = CONFIG;

class Server {
    constructor(mediator) {
        this.mediator = mediator;
        this.socket = io(HOST);
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on("connect", () => {
            console.log('connect');

            const { SOCKET } = CONFIG;

            this.socket.on(SOCKET.LOGIN, (data) => this.handleLogin(data));
        });
    }

}