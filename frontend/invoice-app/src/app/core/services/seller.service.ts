import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Seller, CreateSellerRequest, UpdateSellerRequest } from '../models';
import { PagedResult } from '../../shared/models/paged-result.interface';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private readonly apiUrl = `${environment.apiBaseUrl}/sellers`;
  private http = inject(HttpClient);

  getAll(): Observable<PagedResult<Seller>> {
    return this.http.get<Seller[]>(this.apiUrl).pipe(
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

  getById(id: string): Observable<Seller> {
    return this.http.get<Seller>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateSellerRequest): Observable<Seller> {
    return this.http.post<Seller>(this.apiUrl, request);
  }

  update(id: string, request: UpdateSellerRequest): Observable<Seller> {
    return this.http.put<Seller>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
