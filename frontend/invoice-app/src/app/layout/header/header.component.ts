import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ButtonModule, AvatarModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Output() onToggleSidebar = new EventEmitter<void>();
  user = { name: 'Administrador' };

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
