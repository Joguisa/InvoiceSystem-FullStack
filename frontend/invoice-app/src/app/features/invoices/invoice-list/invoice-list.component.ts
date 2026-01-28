import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { ColDef } from '../../../shared/models/col-def.interface';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent {
  breadcrumbs: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Facturas' }
  ];
}
