import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { toParams } from '../http-params';
import { DeliveryStats, RevenueStats, StatsQuery } from '../models';

@Injectable({ providedIn: 'root' })
export class StatisticsApi {
  private readonly http = inject(HttpClient);

  deliveries(query: StatsQuery): Observable<DeliveryStats> {
    return this.http.get<DeliveryStats>('/api/statistics/deliveries', { params: toParams({ ...query }) });
  }
  revenue(query: StatsQuery): Observable<RevenueStats> {
    return this.http.get<RevenueStats>('/api/statistics/revenue', { params: toParams({ ...query }) });
  }
}
