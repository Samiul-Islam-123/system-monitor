import { io, Socket } from 'socket.io-client';
import { SystemMetrics } from '@/lib/mockData';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(onConnect?: () => void, onDisconnect?: () => void, onError?: (error: any) => void) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io('http://100.89.71.38:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      onConnect?.();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      onError?.(error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribeToLiveUpdates(callback: (metrics: SystemMetrics) => void, interval: string = 'live') {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('subscribe_live', interval);

    this.socket.on('metrics_update', (metrics: SystemMetrics) => {
      callback(metrics);
    });
  }

  requestMetricsUpdate(callback: (metrics: SystemMetrics) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('request_metrics');

    this.socket.once('metrics_update', (metrics: SystemMetrics) => {
      callback(metrics);
    });
  }

  unsubscribeFromLiveUpdates() {
    if (!this.socket) return;

    this.socket.off('metrics_update');
  }

  get isConnectedStatus(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();