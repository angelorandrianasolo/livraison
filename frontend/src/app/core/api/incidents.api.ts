import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { toParams } from '../http-params';
import { Incident, IncidentType, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class IncidentsApi {
  private readonly http = inject(HttpClient);

  search(query: { resolved?: boolean | null; page?: number; size?: number }): Observable<Page<Incident>> {
    return this.http.get<Page<Incident>>('/api/incidents', { params: toParams({ ...query }) });
  }
  byOrder(orderId: number): Observable<Incident[]> {
    return this.http.get<Incident[]>(`/api/orders/${orderId}/incidents`);
  }
  report(orderId: number, body: { type: IncidentType; description: string }): Observable<Incident> {
    return this.http.post<Incident>(`/api/orders/${orderId}/incidents`, body);
  }
  resolve(id: number, resolution: string): Observable<Incident> {
    return this.http.put<Incident>(`/api/incidents/${id}/resolve`, { resolution });
  }
}
