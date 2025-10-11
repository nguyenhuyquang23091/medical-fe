import {io, Socket} from "socket.io-client";
import { WEBSOCKET_URL } from "./config/configuration";


let socket: Socket | null = null;

export const initSocketIo = ( token : string) : Socket => {
    if(!socket || !socket.connected){
        if(socket) {
            socket.disconnect();
            socket = null;
        }

        socket = io(WEBSOCKET_URL, {
            auth: {
                token
            },
            query : {
                token
            },
            transports : ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error.message);
        });
    }

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
        socket.off('notification');
        socket.on('notification', (data) => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in notification callback:', error);
            }
        });
    }
}

export const unsubscribeFromNotifications = () => {
    if (socket) {
        socket.off('notification');
    }
}

export const subscribeToNotificationUpdates = (callback: (data: any) => void) => {
    if (socket) {
        socket.off('notification_update');
        socket.on('notification_update', (data) => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in notification_update callback:', error);
            }
        });
    }
}

export const unsubscribeFromNotificationUpdates = () => {
    if (socket) {
        socket.off('notification_update');
    }
}