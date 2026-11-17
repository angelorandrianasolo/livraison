import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { toParams } from '../http-params';
import { DeliverRequest, Order, OrderQuery, OrderRequest, Page, TrackingEvent } from '../models';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/orders';

  search(query: OrderQuery): Observable<Page<Order>> {
    return this.http.get<Page<Order>>(this.base, { params: toParams({ ...query }) });
  }
  get(id: number): Observable<Order> { return this.http.get<Order>(`${this.base}/${id}`); }
  create(body: OrderRequest): Observable<Order> { return this.http.post<Order>(this.base, body); }
  update(id: number, body: Omit<OrderRequest, 'customerId'>): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}`, body);
  }
  assign(id: number, delivererId?: number): Observable<Order> {
    return this.http.post<Order>(`${this.base}/${id}/assign`, delivererId ? { delivererId } : {});
  }
  pickup(id: number): Observable<Order> { return this.http.post<Order>(`${this.base}/${id}/pickup`, {}); }
  start(id: number): Observable<Order> { return this.http.post<Order>(`${this.base}/${id}/start`, {}); }
  deliver(id: number, body: DeliverRequest): Observable<Order> {
    return this.http.post<Order>(`${this.base}/${id}/deliver`, body);
  }
  cancel(id: number, reason?: string): Observable<Order> {
    return this.http.post<Order>(`${this.base}/${id}/cancel`, { reason });
  }
  markReturned(id: number): Observable<Order> { return this.http.post<Order>(`${this.base}/${id}/return`, {}); }
  tracking(id: number): Observable<TrackingEvent[]> {
    return this.http.get<TrackingEvent[]>(`${this.base}/${id}/tracking`);
  }
}
