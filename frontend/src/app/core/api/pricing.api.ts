import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PriceBreakdown, PriceEstimateRequest, PricingConfig } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingApi {
  private readonly http = inject(HttpClient);

  config(): Observable<PricingConfig> { return this.http.get<PricingConfig>('/api/pricing/config'); }
  updateConfig(body: PricingConfig): Observable<PricingConfig> {
    return this.http.put<PricingConfig>('/api/pricing/config', body);
  }
  estimate(body: PriceEstimateRequest): Observable<PriceBreakdown> {
    return this.http.post<PriceBreakdown>('/api/pricing/estimate', body);
  }
}
