import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HttpStatus } from '../constants/http-status.constants';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private messageService = inject(MessageService);

  handle(error: HttpErrorResponse) {
    let detail = 'Error desconocido. Intenta de nuevo.';

    switch (error.status) {
      case HttpStatus.NETWORK_ERROR:
        detail = 'No hay conexión con el servidor. Verifica tu internet o intenta más tarde.';
        break;
      case HttpStatus.UNAUTHORIZED:
        detail = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        break;
      case HttpStatus.FORBIDDEN:
        detail = 'Acceso denegado.';
        break;
      case HttpStatus.NOT_FOUND:
        detail = 'Recurso no encontrado.';
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        detail = 'Error del servidor. Intenta más tarde.';
        break;
      case HttpStatus.BAD_REQUEST:
        detail = 'Solicitud inválida.';
        break;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail,
      life: 5000
    });
  }
}