import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ColDef } from '../../../shared/models/col-def.interface';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, DialogModule, PageHeaderComponent, DataTableComponent, ProductFormComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  breadcrumbs: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Productos' }
  ];

  cols: ColDef[] = [
    { field: 'code', header: 'Código', sortable: true },
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'unitPrice', header: 'Precio', type: 'currency', sortable: true },
    { field: 'stock', header: 'Stock', sortable: true },
    { field: 'actions', header: 'Acciones', type: 'actions' }
  ];

  data = signal<Product[]>([]);
  totalRecords = signal(0);
  loading = signal(false);

  // Modal Form
  dialogVisible = signal(false);
  selectedProduct = signal<Product | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (result) => {
        this.data.set(result.items);
        this.totalRecords.set(result.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ProductList] Error:', err);
        this.loading.set(false);
      }
    });
  }

  openNew() {
    this.selectedProduct.set(null);
    this.dialogVisible.set(true);
  }

  onEdit(product: Product) {
    this.selectedProduct.set(product);
    this.dialogVisible.set(true);
  }

  onDelete(product: Product) {
    this.confirmationService.confirm({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro de eliminar el producto ${product.name}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.delete(product.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado' });
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
