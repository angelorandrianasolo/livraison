import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Zone, ZoneRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ZonesApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/zones';

  list(): Observable<Zone[]> { return this.http.get<Zone[]>(this.base); }
  create(body: ZoneRequest): Observable<Zone> { return this.http.post<Zone>(this.base, body); }
  update(id: number, body: ZoneRequest): Observable<Zone> { return this.http.put<Zone>(`${this.base}/${id}`, body); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
