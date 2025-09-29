import {io, Socket} from "socket.io-client";
import { WEBSOCKET_URL } from "./config/configuration";


let socket: Socket | null = null;

export const initSocketIo = ( token : string) : Socket => {
    if(!socket){
        socket = io(WEBSOCKET_URL, {
            query : {
                token
            },
            transports : ["websocket", "polling"]
        });
    }

    socket.on('connect', () => {
        console.log('Connected to Socket.IO');
    });

    return socket;
}

export const socketDisconnect = () => {
    if( socket){
        socket.disconnect();
        socket = null;
    };
}

export const getSocket = (): Socket | null => {
    return socket;
}

export const isSocketConnected = (): boolean => {
    return socket?.connected || false;
}

export const getSocketStatus = () => {
    return {
        connected: socket?.connected || false,
        id: socket?.id || null,
        url: WEBSOCKET_URL
    };
}

export const subscribeToNotifications = (callback: (data: any) => void) => {
    if (socket) {
        socket.on('notification', callback);
    }
}

export const unsubscribeFromNotifications = () => {
    if (socket) {
        socket.off('notification');
    }
}