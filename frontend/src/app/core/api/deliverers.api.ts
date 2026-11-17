import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { toParams } from '../http-params';
import { Deliverer, DelivererCandidate, DelivererRequest, DelivererStatus, Page } from '../models';

export interface DelivererQuery {
  q?: string;
  status?: DelivererStatus | '';
  zoneId?: number | null;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class DeliverersApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/deliverers';

  search(query: DelivererQuery): Observable<Page<Deliverer>> {
    return this.http.get<Page<Deliverer>>(this.base, { params: toParams({ ...query }) });
  }
  get(id: number): Observable<Deliverer> { return this.http.get<Deliverer>(`${this.base}/${id}`); }
  available(orderId?: number): Observable<DelivererCandidate[]> {
    return this.http.get<DelivererCandidate[]>(`${this.base}/available`, { params: toParams({ orderId }) });
  }
  create(body: DelivererRequest): Observable<Deliverer> { return this.http.post<Deliverer>(this.base, body); }
  update(id: number, body: DelivererRequest): Observable<Deliverer> {
    return this.http.put<Deliverer>(`${this.base}/${id}`, body);
  }
  updateStatus(id: number, status: DelivererStatus): Observable<Deliverer> {
    return this.http.patch<Deliverer>(`${this.base}/${id}/status`, { status });
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
