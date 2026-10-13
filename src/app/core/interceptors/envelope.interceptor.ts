import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  statusCode: number;
}

function isEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return !!body && typeof body === 'object' && 'success' in body && 'data' in body;
}

export const envelopeInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    map((event) => (event instanceof HttpResponse && isEnvelope(event.body) ? event.clone({ body: event.body.data }) : event))
  );
