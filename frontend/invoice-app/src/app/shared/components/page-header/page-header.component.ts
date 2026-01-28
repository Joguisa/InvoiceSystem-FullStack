import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, BreadcrumbModule, RouterLink],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  title = input.required<string>();
  breadcrumbs = input<MenuItem[]>([]);
  showAddButton = input<boolean>(false);
  addButtonLabel = input<string>('Nuevo');
  addRoute = input<string[] | string | null>(null);
}
