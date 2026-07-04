import CONFIG from "../../config";
import Mediator from "./Mediator";

const { MEDIATOR, SOCKET } = CONFIG;

const useMediator = () => {
    const { EVENTS, TRIGGERS } = MEDIATOR;
    const EVENT_SOCKETS = {};

    Object.assign(EVENT_SOCKETS, EVENTS);
    Object.assign(EVENT_SOCKETS, SOCKET);

    return new Mediator({ EVENTS: EVENT_SOCKETS, TRIGGERS });
}

export default useMediator;