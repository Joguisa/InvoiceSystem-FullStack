import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Customer, CreateCustomerRequest, IdentificationType, IdentificationTypeLabels } from '../../../core/models';
import { CustomerService } from '../../../core/services/customer.service';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, InputMaskDirective],
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
    this.form.get('identificationType')?.valueChanges.subscribe(type => {
      if (typeof type === 'string') {
        const numType = Number(type);
        if (!isNaN(numType)) {
          this.form.get('identificationType')?.setValue(numType, { emitEvent: false });
        }
      }
      this.updateIdentificationValidators(type);
    });
    const currentType = this.form.get('identificationType')?.value;
    this.updateIdentificationValidators(currentType);
  }

  updateIdentificationValidators(type: IdentificationType | number | string) {
    const identificationControl = this.form.get('identification');
    if (!identificationControl) return;

    const typeValue = Number(type);
    let validators = [Validators.required];

    switch (typeValue) {
      case IdentificationType.Cedula:
        validators.push(Validators.pattern(/^[0-9]{10}$/));
        break;
      case IdentificationType.RUC:
        validators.push(Validators.pattern(/^[0-9]{13}$/));
        break;
      case IdentificationType.Pasaporte:
        validators.push(Validators.pattern(/^[A-Za-z0-9]{5,20}$/));
        break;
    }

    identificationControl.setValidators(validators);
    identificationControl.updateValueAndValidity({ emitEvent: false });
  }

  getIdentificationError(): string {
    const ctrl = this.f['identification'];
    if (!ctrl.errors) return '';

    const type = Number(this.form.get('identificationType')?.value);

    if (ctrl.errors['required']) return 'Identificación es requerida.';
    if (ctrl.errors['pattern']) {
      switch (type) {
        case IdentificationType.Cedula: return 'Cédula debe tener exactamente 10 dígitos.';
        case IdentificationType.RUC: return 'RUC debe tener exactamente 13 dígitos.';
        case IdentificationType.Pasaporte: return 'Pasaporte debe tener entre 5-20 caracteres alfanuméricos.';
      }
    }
    return 'Identificación inválida.';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customer'] && this.customer) {
      const type = Number(this.customer.identificationType);

      const cleanedIdentification = this.customer.identification?.trim() || '';

      this.form.get('identificationType')?.setValue(type, { emitEvent: false });
      this.updateIdentificationValidators(type);
      this.form.patchValue({
        ...this.customer,
        identificationType: type,
        identification: cleanedIdentification
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.submitted.set(false);
    } else if (changes['customer']) {
      this.form.reset({ identificationType: IdentificationType.Cedula });
      this.updateIdentificationValidators(IdentificationType.Cedula);
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
