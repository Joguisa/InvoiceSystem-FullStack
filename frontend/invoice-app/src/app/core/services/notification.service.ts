import { Injectable, signal } from '@angular/core';
import { NOTIFICATION_DURATION } from '../constants/notification-config.const';
import { Notification } from '../models/notification/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  currentNotification = signal<Notification | null>(null);
  private hideTimeout: any = null;

  add(
    message: string,
    type: Notification['type'],
    duration: number | null = NOTIFICATION_DURATION.DEFAULT
  ) {
    const current = this.currentNotification();
    if (current && current.message === message && current.type === type) {
      return;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    const id = crypto.randomUUID();
    this.currentNotification.set({ id, message, type, duration });

    if (duration) {
      this.hideTimeout = setTimeout(() => this.clear(), duration);
    }
  }

  error(message: string, duration: number | null = NOTIFICATION_DURATION.DEFAULT) {
    this.add(message, 'error', duration);
  }

  success(message: string, duration: number | null = NOTIFICATION_DURATION.DEFAULT) {
    this.add(message, 'success', duration);
  }

  warning(message: string, duration: number | null = NOTIFICATION_DURATION.DEFAULT) {
    this.add(message, 'warning', duration);
  }

  info(message: string, duration: number | null = NOTIFICATION_DURATION.DEFAULT) {
    this.add(message, 'info', duration);
  }

  clear() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.currentNotification.set(null);
  }

  remove(id: string) {
    this.clear();
  }
}
