import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../models';
import { PagedResult } from '../../shared/models/paged-result.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = `${environment.apiBaseUrl}/customers`;
  private http = inject(HttpClient);

  getAll(): Observable<PagedResult<Customer>> {
    // Backend returns array, we wrap it into PagedResult for consistency
    return this.http.get<Customer[]>(this.apiUrl).pipe(
      map(items => ({
        items: items || [],
        totalCount: items?.length || 0,
        page: 1,
        pageSize: items?.length || 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      }))
    );
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, request);
  }

  update(id: string, request: UpdateCustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
