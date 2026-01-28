import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpStatus } from '../constants/http-status.constants';
import { NOTIFICATION_DURATION } from '../constants/notification-config.const';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private notification = inject(NotificationService);

  handle(error: HttpErrorResponse) {
    switch (error.status) {
      case HttpStatus.NETWORK_ERROR:
        this.notification.error(
          'No hay conexión con el servidor. Verifica tu internet o intenta más tarde.',
          NOTIFICATION_DURATION.LONG
        );
        break;
      case HttpStatus.UNAUTHORIZED:
        this.notification.error(
          'Sesión expirada. Por favor inicia sesión nuevamente.',
          NOTIFICATION_DURATION.LONG
        );
        break;
      case HttpStatus.FORBIDDEN:
        this.notification.error(
          'Acceso denegado.',
          NOTIFICATION_DURATION.DEFAULT
        );
        break;
      case HttpStatus.NOT_FOUND:
        this.notification.error(
          'Recurso no encontrado.',
          NOTIFICATION_DURATION.DEFAULT
        );
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        this.notification.error(
          'Error del servidor. Intenta más tarde.',
          NOTIFICATION_DURATION.LONG
        );
        break;
      case HttpStatus.BAD_REQUEST:
        this.notification.error(
          'Solicitud inválida.',
          NOTIFICATION_DURATION.DEFAULT
        );
        break;
      default:
        this.notification.error(
          'Error desconocido. Intenta de nuevo.',
          NOTIFICATION_DURATION.DEFAULT
        );
    }
  }
}