import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: HttpErrorResponse, fallback = 'Ocurrió un error inesperado. Intente nuevamente.'): string {
  const body = error.error;

  if (Array.isArray(body) && body.length > 0 && typeof body[0] === 'string') {
    return body.join(' ');
  }

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      return body.errors.join(' ');
    }
  }

  if (error.status === 401) {
    return 'Su sesión expiró. Vuelva a iniciar sesión.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifique su conexión.';
  }

  return fallback;
}
