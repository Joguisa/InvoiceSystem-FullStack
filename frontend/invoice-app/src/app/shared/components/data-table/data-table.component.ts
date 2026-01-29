import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ColDef } from '../../models/col-def.interface';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, StatusBadgeComponent],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() cols: ColDef[] = [];
  @Input() totalRecords: number = 0;
  @Input() loading: boolean = false;
  @Input() rows: number = 10;
  @Input() paginator: boolean = true;
  @Input() rowHover: boolean = true;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  edit(row: any) {
    this.onEdit.emit(row);
  }

  delete(row: any) {
    this.onDelete.emit(row);
  }
}
