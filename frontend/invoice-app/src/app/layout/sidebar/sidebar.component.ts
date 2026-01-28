import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MenuModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Facturación',
        items: [
          { label: 'Facturas', icon: 'pi pi-file', routerLink: '/invoices' },
          { label: 'Clientes', icon: 'pi pi-users', routerLink: '/customers' },
          { label: 'Vendedores', icon: 'pi pi-id-card', routerLink: '/sellers' },
          { label: 'Productos', icon: 'pi pi-box', routerLink: '/products' }
        ]
      }
    ];
  }
}
