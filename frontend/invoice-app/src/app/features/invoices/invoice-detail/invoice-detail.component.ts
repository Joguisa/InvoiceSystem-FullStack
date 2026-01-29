import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { InvoiceService } from '../../../core/services/invoice.service';
import {
  Invoice, InvoiceStatus, InvoiceStatusLabels,
  CreateInvoicePaymentRequest, PaymentMethod, PaymentMethodLabels
} from '../../../core/models';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, CardModule, DialogModule, DividerModule,
    SelectModule, InputTextModule, InputNumberModule, TableModule, TagModule,
    PageHeaderComponent
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  breadcrumbs: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Facturas', routerLink: '/invoices' },
    { label: 'Detalle' }
  ];

  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  paymentDialogVisible = signal(false);

  // Payment Form (reactive)
  paymentForm: FormGroup = this.fb.group({
    paymentMethod: [PaymentMethod.Cash, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    installments: [0, [Validators.min(0), Validators.max(60)]],
    reference: [''],
    notes: ['']
  });

  paymentMethods = [
    { label: PaymentMethodLabels[PaymentMethod.Cash], value: PaymentMethod.Cash },
    { label: PaymentMethodLabels[PaymentMethod.CreditCard], value: PaymentMethod.CreditCard },
    { label: PaymentMethodLabels[PaymentMethod.DebitCard], value: PaymentMethod.DebitCard },
    { label: PaymentMethodLabels[PaymentMethod.BankTransfer], value: PaymentMethod.BankTransfer },
    { label: PaymentMethodLabels[PaymentMethod.Check], value: PaymentMethod.Check },
    { label: PaymentMethodLabels[PaymentMethod.MobilePayment], value: PaymentMethod.MobilePayment },
    { label: PaymentMethodLabels[PaymentMethod.ElectronicWallet], value: PaymentMethod.ElectronicWallet }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(id);
    }
  }

  loadInvoice(id: string): void {
    this.loading.set(true);
    this.invoiceService.getById(id).subscribe({
      next: (data) => {
        this.invoice.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la factura' });
        this.loading.set(false);
        this.router.navigate(['/invoices']);
      }
    });
  }

  getStatusSeverity(status: InvoiceStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case InvoiceStatus.Paid: return 'success';
      case InvoiceStatus.Issued: return 'info';
      case InvoiceStatus.PartiallyPaid: return 'warn';
      case InvoiceStatus.Cancelled: return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: InvoiceStatus): string {
    return InvoiceStatusLabels[status] || status.toString();
  }

  openPaymentDialog(): void {
    // Reset form with pending amount as default
    this.paymentForm.reset({
      paymentMethod: PaymentMethod.Cash,
      amount: this.invoice()?.pendingAmount || 0,
      installments: 0,
      reference: '',
      notes: ''
    });
    this.paymentDialogVisible.set(true);
  }

  closePaymentDialog(): void {
    this.paymentDialogVisible.set(false);
  }

  addPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos requeridos' });
      return;
    }

    if (!this.invoice()) {
      return;
    }

    if (this.paymentForm.value.amount > this.invoice()!.pendingAmount) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El monto no puede ser mayor al saldo pendiente' });
      return;
    }

    const payment: CreateInvoicePaymentRequest = {
      paymentMethod: this.paymentForm.value.paymentMethod,
      amount: this.paymentForm.value.amount,
      paymentDate: new Date().toISOString(),
      reference: this.paymentForm.value.reference || '',
      installments: this.paymentForm.value.paymentMethod === PaymentMethod.CreditCard ? this.paymentForm.value.installments : 0,
      notes: this.paymentForm.value.notes || ''
    };

    this.invoiceService.addPayment(this.invoice()!.id, payment).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pago registrado correctamente' });
        this.paymentDialogVisible.set(false);
        this.loadInvoice(this.invoice()!.id);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el pago' });
      }
    });
  }

  cancelInvoice(): void {
    if (!this.invoice()) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Anular Factura',
      message: '¿Está seguro de anular esta factura? Esta acción no se puede deshacer.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.invoiceService.cancel(this.invoice()!.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Factura anulada correctamente' });
            this.loadInvoice(this.invoice()!.id);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo anular la factura' });
          }
        });
      }
    });
  }

  selectOnFocus(event: any): void {
    event.target?.select();
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }

  get pf() {
    return this.paymentForm.controls;
  }

  get referencePlaceholder(): string {
    const method = this.paymentForm.get('paymentMethod')?.value;
    switch (method) {
      case PaymentMethod.Cash: return 'Opcional';
      case PaymentMethod.CreditCard:
      case PaymentMethod.DebitCard: return 'Nro. Autorización / Voucher';
      case PaymentMethod.BankTransfer: return 'Nro. Operación / Banco';
      case PaymentMethod.Check: return 'Nro. Cheque - Banco';
      case PaymentMethod.MobilePayment: return 'Nro. Teléfono / Referencia';
      default: return 'Nro. Transacción / Referencia';
    }
  }
}
