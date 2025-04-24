import { io } from "socket.io-client";

// Create a socket instance
export const socket = io(
  import.meta.env.VITE_SOCKET_URL || window.location.origin,
  {
    autoConnect: false,
    withCredentials: true,
  }
);

// Connect with auth token when available
export const connectSocket = () => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    socket.auth = { token };
    socket.connect();
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Join a mind map room
export const joinMindMap = (mindMapId: string) => {
  if (!socket.connected) {
    connectSocket();
  }

  socket.emit("join:mindmap", { mindMapId });
};

// Leave a mind map room
export const leaveMindMap = (mindMapId: string) => {
  socket.emit("leave:mindmap", { mindMapId });
};

// Export a hook that can be used for socket events
export const useSocketListener = <T = any>(
  event: string,
  callback: (data: T) => void
) => {
  socket.on(event, callback);

  return () => {
    socket.off(event, callback);
  };
};
