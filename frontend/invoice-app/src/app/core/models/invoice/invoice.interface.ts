import { InvoiceStatus } from '../enums/invoice-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    issueDate: string;
    customerId: string;
    customerName: string;
    customerIdentification: string;
    customerPhone?: string;
    customerEmail?: string;
    sellerId: string;
    sellerName: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    totalPaid: number;
    pendingAmount: number;
    status: InvoiceStatus;
    statusName: string;
    notes?: string;
    createdAt: string;
    details: InvoiceDetail[];
    payments: InvoicePayment[];
}

export interface InvoiceDetail {
    id: string;
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
}

export interface InvoicePayment {
    id: string;
    paymentMethod: PaymentMethod;
    paymentMethodName: string;
    amount: number;
    reference?: string;
    cardLastFourDigits?: string;
    bankName?: string;
    paymentDate: string;
    notes?: string;
    installments?: number;
    isVoided: boolean;
}

export interface InvoiceFilterRequest {
    invoiceNumber?: string;
    fromDate?: string;
    toDate?: string;
    customerId?: string;
    sellerId?: string;
    status?: InvoiceStatus;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    pageSize?: number;
}

export interface CreateInvoiceRequest {
    customerId: string;
    sellerId: string;
    issueDate: string;
    notes?: string;
    details: CreateInvoiceDetailRequest[];
    payments: CreateInvoicePaymentRequest[];
}

export interface CreateInvoiceDetailRequest {
    productId: string;
    quantity: number;
    discount: number;
}

export interface CreateInvoicePaymentRequest {
    paymentMethod: PaymentMethod;
    amount: number;
    reference?: string;
    cardLastFourDigits?: string;
    bankName?: string;
    installments?: number;
    paymentDate: string;
    notes?: string;
}
