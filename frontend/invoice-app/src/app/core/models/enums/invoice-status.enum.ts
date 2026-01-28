export enum InvoiceStatus {
    Draft = 1,
    Issued = 2,
    PartiallyPaid = 3,
    Paid = 4,
    Cancelled = 5
}

export const InvoiceStatusLabels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Draft]: 'Borrador',
    [InvoiceStatus.Issued]: 'Emitida',
    [InvoiceStatus.PartiallyPaid]: 'Pago Parcial',
    [InvoiceStatus.Paid]: 'Pagada',
    [InvoiceStatus.Cancelled]: 'Anulada'
};
