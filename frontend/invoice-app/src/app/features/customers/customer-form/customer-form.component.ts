import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Customer, CreateCustomerRequest, IdentificationType, IdentificationTypeLabels } from '../../../core/models';
import { CustomerService } from '../../../core/services/customer.service';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, DropdownModule, ButtonModule, InputMaskDirective],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnChanges, OnInit {
  @Input() customer: Customer | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private messageService = inject(MessageService);

  form: FormGroup = this.fb.group({
    identificationType: [IdentificationType.Cedula, Validators.required],
    identification: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.pattern(/^[0-9]{7,15}$/)]],
    email: ['', Validators.email],
    address: ['', Validators.maxLength(200)]
  });

  identificationTypes = [
    { label: IdentificationTypeLabels[IdentificationType.Cedula], value: IdentificationType.Cedula },
    { label: IdentificationTypeLabels[IdentificationType.RUC], value: IdentificationType.RUC },
    { label: IdentificationTypeLabels[IdentificationType.Pasaporte], value: IdentificationType.Pasaporte }
  ];

  // Expose enum to template
  IdentificationType = IdentificationType;

  submitted = signal(false);

  get f() { return this.form.controls; }

  ngOnInit() {
    // Subscribe to identificationType changes
    this.form.get('identificationType')?.valueChanges.subscribe(type => {
      this.updateIdentificationValidators(type);
    });
    // Set initial validators
    this.updateIdentificationValidators(IdentificationType.Cedula);
  }

  updateIdentificationValidators(type: IdentificationType) {
    const identificationControl = this.form.get('identification');
    if (!identificationControl) return;

    let validators = [Validators.required];

    switch (type) {
      case IdentificationType.Cedula:
        // Cédula: exactly 10 digits
        validators.push(Validators.pattern(/^[0-9]{10}$/));
        break;
      case IdentificationType.RUC:
        // RUC: exactly 13 digits
        validators.push(Validators.pattern(/^[0-9]{13}$/));
        break;
      case IdentificationType.Pasaporte:
        // Pasaporte: alphanumeric, 5-20 characters
        validators.push(Validators.pattern(/^[A-Za-z0-9]{5,20}$/));
        break;
    }

    identificationControl.setValidators(validators);
    identificationControl.updateValueAndValidity();
  }

  getIdentificationError(): string {
    const type = this.form.get('identificationType')?.value;
    const ctrl = this.f['identification'];

    if (ctrl.errors?.['required']) return 'Identificación es requerida.';
    if (ctrl.errors?.['pattern']) {
      switch (type) {
        case IdentificationType.Cedula: return 'Cédula debe tener exactamente 10 dígitos.';
        case IdentificationType.RUC: return 'RUC debe tener exactamente 13 dígitos.';
        case IdentificationType.Pasaporte: return 'Pasaporte debe tener entre 5-20 caracteres alfanuméricos.';
      }
    }
    return '';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customer'] && this.customer) {
      this.form.patchValue(this.customer);
      this.updateIdentificationValidators(this.customer.identificationType);
      this.submitted.set(false);
    } else {
      this.form.reset({ identificationType: IdentificationType.Cedula });
      this.submitted.set(false);
    }
  }

  submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const request: CreateCustomerRequest = this.form.value;

    const obs = this.customer
      ? this.customerService.update(this.customer.id, request)
      : this.customerService.create(request);

    obs.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.customer ? 'Cliente actualizado' : 'Cliente creado'
        });
        this.onSave.emit();
      }
    });
  }
}
