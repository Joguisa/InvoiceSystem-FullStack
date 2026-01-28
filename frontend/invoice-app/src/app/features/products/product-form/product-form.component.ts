import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, TextareaModule, ButtonModule, InputMaskDirective],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private messageService = inject(MessageService);

  form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(200)]],
    unitPrice: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  submitted = signal(false);

  get f() { return this.form.controls; }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && this.product) {
      this.form.patchValue(this.product);
      this.submitted.set(false);
    } else {
      this.form.reset({ unitPrice: 0, stock: 0 });
      this.submitted.set(false);
    }
  }

  submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const request: CreateProductRequest = this.form.value;

    const obs = this.product
      ? this.productService.update(this.product.id, request)
      : this.productService.create(request);

    obs.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.product ? 'Producto actualizado' : 'Producto creado'
        });
        this.onSave.emit();
      }
    });
  }
}
