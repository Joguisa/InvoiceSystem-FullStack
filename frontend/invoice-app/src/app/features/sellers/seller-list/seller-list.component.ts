import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { SellerFormComponent } from '../seller-form/seller-form.component';
import { ColDef } from '../../../shared/models/col-def.interface';
import { SellerService } from '../../../core/services/seller.service';
import { Seller } from '../../../core/models';

@Component({
  selector: 'app-seller-list',
  standalone: true,
  imports: [CommonModule, DialogModule, PageHeaderComponent, DataTableComponent, SellerFormComponent],
  templateUrl: './seller-list.component.html',
  styleUrls: ['./seller-list.component.scss']
})
export class SellerListComponent implements OnInit {
  private sellerService = inject(SellerService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  breadcrumbs: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Vendedores' }
  ];

  cols: ColDef[] = [
    { field: 'code', header: 'Código', sortable: true },
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'email', header: 'Correo' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'actions', header: 'Acciones', type: 'actions' }
  ];

  data = signal<Seller[]>([]);
  totalRecords = signal(0);
  loading = signal(false);

  // Modal Form
  dialogVisible = signal(false);
  selectedSeller = signal<Seller | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.sellerService.getAll().subscribe({
      next: (result) => {
        this.data.set(result.items);
        this.totalRecords.set(result.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[SellerList] Error:', err);
        this.loading.set(false);
      }
    });
  }

  openNew() {
    this.selectedSeller.set(null);
    this.dialogVisible.set(true);
  }

  onEdit(seller: Seller) {
    this.selectedSeller.set(seller);
    this.dialogVisible.set(true);
  }

  onDelete(seller: Seller) {
    this.confirmationService.confirm({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro de eliminar al vendedor ${seller.name}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.sellerService.delete(seller.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Vendedor eliminado' });
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
