import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Seller, CreateSellerRequest, UpdateSellerRequest } from '../../../core/models';
import { SellerService } from '../../../core/services/seller.service';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';

@Component({
  selector: 'app-seller-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, InputMaskDirective],
  templateUrl: './seller-form.component.html',
  styleUrls: ['./seller-form.component.scss']
})
export class SellerFormComponent implements OnChanges {
  @Input() seller: Seller | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private sellerService = inject(SellerService);
  private messageService = inject(MessageService);

  form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.pattern(/^[0-9]{7,15}$/)]],
    email: ['', Validators.email],
  });

  submitted = signal(false);

  get f() { return this.form.controls; }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['seller'] && this.seller) {
      this.form.patchValue(this.seller);
      this.submitted.set(false);
    } else {
      this.form.reset();
      this.submitted.set(false);
    }
  }

  submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const request: CreateSellerRequest = this.form.value;

    const obs = this.seller
      ? this.sellerService.update(this.seller.id, request)
      : this.sellerService.create(request);

    obs.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.seller ? 'Vendedor actualizado' : 'Vendedor creado'
        });
        this.onSave.emit();
      }
    });
  }
}
