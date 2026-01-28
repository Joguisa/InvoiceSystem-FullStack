import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models';
import { PagedResult } from '../../shared/models/paged-result.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiBaseUrl}/products`;
  private http = inject(HttpClient);

  getAll(): Observable<PagedResult<Product>> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
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

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request);
  }

  update(id: string, request: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
