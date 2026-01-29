import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, InvoiceFilterRequest, CreateInvoiceRequest, CreateInvoicePaymentRequest, InvoicePayment, PagedResult } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly apiUrl = `${environment.apiBaseUrl}/invoices`;
  private http = inject(HttpClient);

  getAll(filter?: InvoiceFilterRequest): Observable<PagedResult<Invoice>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.invoiceNumber) params = params.set('invoiceNumber', filter.invoiceNumber);
      if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
      if (filter.toDate) params = params.set('toDate', filter.toDate);
      if (filter.customerId) params = params.set('customerId', filter.customerId);
      if (filter.sellerId) params = params.set('sellerId', filter.sellerId);
      if (filter.status !== undefined && filter.status !== null) params = params.set('status', filter.status.toString());
      if (filter.minAmount !== undefined) params = params.set('minAmount', filter.minAmount.toString());
      if (filter.maxAmount !== undefined) params = params.set('maxAmount', filter.maxAmount.toString());
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<PagedResult<Invoice>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, request);
  }

  cancel(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  addPayment(invoiceId: string, request: CreateInvoicePaymentRequest): Observable<InvoicePayment> {
    return this.http.post<InvoicePayment>(`${this.apiUrl}/${invoiceId}/payments`, request);
  }
}
