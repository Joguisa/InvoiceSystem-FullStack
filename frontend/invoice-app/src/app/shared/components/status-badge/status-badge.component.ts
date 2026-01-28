import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  status = input.required<any>();

  displayValue = computed(() => {
    const s = this.status();
    if (typeof s === 'boolean') {
      return s ? 'Activo' : 'Inactivo';
    }
    return s;
  });

  severity = computed(() => {
    const s = this.status();
    let statusStr: string;

    if (typeof s === 'boolean') {
      statusStr = s ? 'active' : 'inactive';
    } else {
      statusStr = s.toLowerCase();
    }

    switch (statusStr) {
      case 'active':
      case 'paid':
      case 'completed':
        return 'success';
      case 'inactive':
      case 'pending':
        return 'warn';
      case 'cancelled':
      case 'rejected':
      case 'overdue':
        return 'danger';
      default:
        return 'info';
    }
  });
}
