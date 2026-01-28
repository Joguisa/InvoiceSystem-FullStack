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
  status = input.required<string>();

  severity = computed(() => {
    const s = this.status().toLowerCase();
    switch (s) {
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
