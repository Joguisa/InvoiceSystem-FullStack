import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer.service';
import { SellerService } from '../../../core/services/seller.service';
import { Invoice, InvoiceFilterRequest, InvoiceStatus, InvoiceStatusLabels } from '../../../core/models';

interface SelectOption {
  label: string;
  value: string | number | null;
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, DatePickerModule, SelectModule,
    InputTextModule, TableModule, TagModule, TooltipModule, PageHeaderComponent
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private sellerService = inject(SellerService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  breadcrumbs: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Facturas' }
  ];

  invoices = signal<Invoice[]>([]);
  customers = signal<SelectOption[]>([]);
  sellers = signal<SelectOption[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  rows = 10;
  first = 0;

  filterForm: FormGroup = this.fb.group({
    invoiceNumber: [''],
    dateRange: [null],
    customerId: [''],
    sellerId: [''],
    status: [null]
  });

  statusOptions: SelectOption[] = [
    { label: 'Todos', value: null },
    { label: InvoiceStatusLabels[InvoiceStatus.Issued], value: InvoiceStatus.Issued },
    { label: InvoiceStatusLabels[InvoiceStatus.PartiallyPaid], value: InvoiceStatus.PartiallyPaid },
    { label: InvoiceStatusLabels[InvoiceStatus.Paid], value: InvoiceStatus.Paid },
    { label: InvoiceStatusLabels[InvoiceStatus.Cancelled], value: InvoiceStatus.Cancelled }
  ];

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns(): void {
    this.customerService.getAll().subscribe(result => {
      this.customers.set([
        { label: 'Todos', value: '' },
        ...result.items.map(c => ({ label: c.name, value: c.id }))
      ]);
    });

    this.sellerService.getAll().subscribe(result => {
      this.sellers.set([
        { label: 'Todos', value: '' },
        ...result.items.map(s => ({ label: s.name, value: s.id }))
      ]);
    });
  }

  loadData(): void {
    this.loading.set(true);

    const formValues = this.filterForm.value;
    const filter: InvoiceFilterRequest = {
      page: Math.floor(this.first / this.rows) + 1,
      pageSize: this.rows
    };

    if (formValues.invoiceNumber) {
      filter.invoiceNumber = formValues.invoiceNumber;
    }

    if (formValues.dateRange && formValues.dateRange.length === 2) {
      filter.fromDate = formValues.dateRange[0]?.toISOString();
      filter.toDate = formValues.dateRange[1]?.toISOString();
    }

    if (formValues.customerId) {
      filter.customerId = formValues.customerId;
    }

    if (formValues.sellerId) {
      filter.sellerId = formValues.sellerId;
    }

    if (formValues.status !== null && formValues.status !== undefined) {
      filter.status = formValues.status;
    }

    this.invoiceService.getAll(filter).subscribe({
      next: (result) => {
        this.invoices.set(result.items);
        this.totalRecords.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las facturas' });
      }
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.loadData();
  }

  onFilterChange(): void {
    this.first = 0;
    this.loadData();
  }

  clearFilters(): void {
    this.filterForm.reset({
      invoiceNumber: '',
      dateRange: null,
      customerId: '',
      sellerId: '',
      status: null
    });
    this.first = 0;
    this.loadData();
  }

  openNew(): void {
    this.router.navigate(['/invoices/new']);
  }

  viewInvoice(invoice: Invoice): void {
    this.router.navigate(['/invoices', invoice.id]);
  }

  cancelInvoice(invoice: Invoice): void {
    this.confirmationService.confirm({
      header: 'Anular Factura',
      message: `¿Está seguro de anular la factura ${invoice.invoiceNumber}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.invoiceService.cancel(invoice.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Factura anulada correctamente' });
            this.loadData();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo anular la factura' });
          }
        });
      }
    });
  }

  getStatusSeverity(status: InvoiceStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case InvoiceStatus.Paid: return 'success';
      case InvoiceStatus.Issued: return 'info';
      case InvoiceStatus.PartiallyPaid: return 'warn';
      case InvoiceStatus.Cancelled: return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: InvoiceStatus): string {
    return InvoiceStatusLabels[status] || status.toString();
  }
}
