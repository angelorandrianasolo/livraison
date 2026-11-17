import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { toParams } from '../http-params';
import { Customer, CustomerRequest, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class CustomersApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/customers';

  search(query: { q?: string; page?: number; size?: number }): Observable<Page<Customer>> {
    return this.http.get<Page<Customer>>(this.base, { params: toParams({ ...query }) });
  }
  get(id: number): Observable<Customer> { return this.http.get<Customer>(`${this.base}/${id}`); }
  create(body: CustomerRequest): Observable<Customer> { return this.http.post<Customer>(this.base, body); }
  update(id: number, body: CustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.base}/${id}`, body);
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
