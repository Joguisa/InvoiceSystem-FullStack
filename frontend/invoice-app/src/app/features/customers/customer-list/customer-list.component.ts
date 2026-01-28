import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { ColDef } from '../../../shared/models/col-def.interface';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, DialogModule, PageHeaderComponent, DataTableComponent, CustomerFormComponent],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  breadcrumbs: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Clientes' }
  ];

  cols: ColDef[] = [
    { field: 'identification', header: 'Identificación' },
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'email', header: 'Correo' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'isActive', header: 'Estado', type: 'status' },
    { field: 'actions', header: 'Acciones', type: 'actions' }
  ];

  data = signal<Customer[]>([]);
  totalRecords = signal(0);
  loading = signal(false);

  // Modal Form
  dialogVisible = signal(false);
  selectedCustomer = signal<Customer | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.customerService.getAll().subscribe({
      next: (result) => {
        console.log('[CustomerList] API Response:', result);
        this.data.set(result.items);
        this.totalRecords.set(result.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[CustomerList] API Error:', err);
        this.loading.set(false);
      }
    });
  }

  onLazyLoad(event: any) {
    // Client-side pagination handled by p-table
    console.log('Lazy Load event:', event);
  }


  openNew() {
    this.selectedCustomer.set(null);
    this.dialogVisible.set(true);
  }

  onEdit(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.dialogVisible.set(true);
  }

  onDelete(customer: Customer) {
    this.confirmationService.confirm({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro de eliminar a ${customer.name}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.customerService.delete(customer.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado' });
            this.loadData();
          }
        });
      }
    });
  }

  onFormSaved() {
    this.dialogVisible.set(false);
    this.loadData();
  }

}