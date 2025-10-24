import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });

    this.socket.connect();

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join user room for notifications
      if (userId) {
        this.joinUserRoom(userId);
      }
      
      // Emit custom connect event
      this.emit('socketConnected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('socketDisconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      
      // Handle reconnection attempts
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('socketConnectionError', { error, maxAttemptsReached: true });
      } else {
        this.emit('socketConnectionError', { error, attempts: this.reconnectAttempts });
      }
    });

    // Message events
    this.socket.on('newMessage', (data) => {
      this.emit('newMessage', data);
    });

    this.socket.on('messageEdited', (data) => {
      this.emit('messageEdited', data);
    });

    this.socket.on('messageDeleted', (data) => {
      this.emit('messageDeleted', data);
    });

    this.socket.on('typing', (data) => {
      this.emit('typing', data);
    });

    // Notification events
    this.socket.on('newNotification', (data) => {
      this.emit('newNotification', data);
    });

    // Complaint events
    this.socket.on('complaintUpdate', (data) => {
      this.emit('complaintUpdate', data);
    });

    // User status events
    this.socket.on('userOnline', (data) => {
      this.emit('userOnline', data);
    });

    this.socket.on('userOffline', (data) => {
      this.emit('userOffline', data);
    });

    return this;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Join user-specific room for notifications
  joinUserRoom(userData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join', userData);
    }
  }

  // Join conversation room for messaging
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveConversation', conversationId);
    }
  }

  // Send typing indicator
  startTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', data);
    }
  }

  // Stop typing indicator
  stopTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stopTyping', data);
    }
  }

  // Generic event emitter
  emit(event, data) {
    // Emit to custom listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Send custom event to server
  sendEvent(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot send event ${event}: socket not connected`);
    }
  }

  // Utility methods for common actions
  sendMessage(conversationId, messageData) {
    this.sendEvent('sendMessage', { conversationId, ...messageData });
  }

  joinRoom(roomId) {
    this.sendEvent('joinRoom', { roomId });
  }

  leaveRoom(roomId) {
    this.sendEvent('leaveRoom', { roomId });
  }

  updateUserStatus(status) {
    this.sendEvent('updateStatus', { status });
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;