import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer.service';
import { SellerService } from '../../../core/services/seller.service';
import { ProductService } from '../../../core/services/product.service';
import {
  CreateInvoiceRequest, CreateInvoicePaymentRequest,
  Customer, Seller, Product, PaymentMethod, PaymentMethodLabels
} from '../../../core/models';

interface InvoiceDetailRow {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, DatePickerModule, CardModule,
    SelectModule, InputTextModule, InputNumberModule, TableModule, TextareaModule,
    DividerModule, TooltipModule, PageHeaderComponent, InputMaskDirective
  ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private sellerService = inject(SellerService);
  private productService = inject(ProductService);
  private messageService = inject(MessageService);

  breadcrumbs: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Facturas', routerLink: '/invoices' },
    { label: 'Nueva Factura' }
  ];

  customers = signal<Customer[]>([]);
  sellers = signal<Seller[]>([]);
  products = signal<Product[]>([]);
  selectedCustomer = signal<Customer | null>(null);

  onCustomerChange(event: any) {
    const customerId = event.value;
    const customer = this.customers().find(c => c.id === customerId);
    this.selectedCustomer.set(customer || null);
  }

  paymentMethods = [
    { label: PaymentMethodLabels[PaymentMethod.Cash], value: PaymentMethod.Cash },
    { label: PaymentMethodLabels[PaymentMethod.CreditCard], value: PaymentMethod.CreditCard },
    { label: PaymentMethodLabels[PaymentMethod.DebitCard], value: PaymentMethod.DebitCard },
    { label: PaymentMethodLabels[PaymentMethod.BankTransfer], value: PaymentMethod.BankTransfer },
    { label: PaymentMethodLabels[PaymentMethod.Check], value: PaymentMethod.Check },
    { label: PaymentMethodLabels[PaymentMethod.MobilePayment], value: PaymentMethod.MobilePayment },
    { label: PaymentMethodLabels[PaymentMethod.ElectronicWallet], value: PaymentMethod.ElectronicWallet }
  ];

  form: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
    sellerId: ['', Validators.required],
    issueDate: [new Date(), Validators.required],
    notes: ['']
  });

  detailForm: FormGroup = this.fb.group({
    product: [null, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    discount: [0, [Validators.required, Validators.min(0)]]
  });

  paymentForm: FormGroup = this.fb.group({
    paymentMethod: [PaymentMethod.Cash, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    installments: [0, [Validators.min(0), Validators.max(60)]],
    reference: ['']
  });

  details = signal<InvoiceDetailRow[]>([]);
  payments = signal<CreateInvoicePaymentRequest[]>([]);

  submitted = signal(false);
  loading = signal(false);

  subtotal = computed(() => this.details().reduce((sum, d) => sum + d.lineTotal, 0));
  taxRate = 15;
  taxAmount = computed(() => this.subtotal() * (this.taxRate / 100));
  total = computed(() => this.subtotal() + this.taxAmount());
  totalPayments = computed(() => this.payments().reduce((sum, p) => sum + p.amount, 0));
  pendingAmount = computed(() => this.total() - this.totalPayments());

  ngOnInit() {
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.customerService.getAll().subscribe(result => this.customers.set(result.items));
    this.sellerService.getAll().subscribe(result => this.sellers.set(result.items));
    this.productService.getAll().subscribe(result => this.products.set(result.items));
  }

  addDetail() {
    if (this.detailForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione un producto y cantidad válida' });
      return;
    }

    const selectedProduct: Product = this.detailForm.value.product;
    const quantity: number = this.detailForm.value.quantity;
    const discount: number = this.detailForm.value.discount;

    const existing = this.details().find(d => d.productId === selectedProduct.id);
    if (existing) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El producto ya está agregado' });
      return;
    }

    const lineTotal = (selectedProduct.unitPrice * quantity) - discount;

    this.details.set([
      ...this.details(),
      {
        productId: selectedProduct.id,
        productName: `${selectedProduct.code} - ${selectedProduct.name}`,
        quantity: quantity,
        unitPrice: selectedProduct.unitPrice,
        discount: discount,
        lineTotal: lineTotal > 0 ? lineTotal : 0
      }
    ]);

    this.detailForm.reset({
      product: null,
      quantity: 1,
      discount: 0
    });
  }

  removeDetail(index: number) {
    this.details.set(this.details().filter((_, i) => i !== index));
  }

  addPayment() {
    if (this.paymentForm.invalid || this.paymentForm.value.amount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese un monto válido' });
      return;
    }

    if (this.paymentForm.value.amount > this.pendingAmount()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El monto no puede ser mayor al total pendiente' });
      return;
    }

    const newPayment: CreateInvoicePaymentRequest = {
      paymentMethod: this.paymentForm.value.paymentMethod,
      amount: this.paymentForm.value.amount,
      paymentDate: new Date().toISOString(),
      reference: this.paymentForm.value.reference || '',
      installments: this.paymentForm.value.paymentMethod === PaymentMethod.CreditCard ? this.paymentForm.value.installments : 0,
      notes: ''
    };

    this.payments.set([...this.payments(), newPayment]);

    this.paymentForm.reset({
      paymentMethod: PaymentMethod.Cash,
      amount: 0,
      installments: 0,
      reference: ''
    });
  }

  removePayment(index: number) {
    this.payments.set(this.payments().filter((_, i) => i !== index));
  }

  submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos requeridos' });
      return;
    }

    if (this.details().length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Agregue al menos un producto' });
      return;
    }

    this.loading.set(true);

    const request: CreateInvoiceRequest = {
      customerId: this.form.value.customerId,
      sellerId: this.form.value.sellerId,
      issueDate: this.form.value.issueDate.toISOString(),
      notes: this.form.value.notes,
      details: this.details().map(d => ({
        productId: d.productId,
        quantity: d.quantity,
        discount: d.discount
      })),
      payments: this.payments()
    };

    this.invoiceService.create(request).subscribe({
      next: (invoice) => {
        console.log('invoice', invoice);
        this.loading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Factura creada correctamente' });
        this.router.navigate(['/invoices', invoice.id]);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/invoices']);
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    return PaymentMethodLabels[method] || '';
  }

  selectOnFocus(event: any): void {
    event.target?.select();
  }

  get f() { return this.form.controls; }
  get df() { return this.detailForm.controls; }
  get pf() { return this.paymentForm.controls; }

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
