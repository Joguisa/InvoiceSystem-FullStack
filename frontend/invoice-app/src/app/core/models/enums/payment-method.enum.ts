export enum PaymentMethod {
    Cash = 1,
    CreditCard = 2,
    DebitCard = 3,
    BankTransfer = 4,
    Check = 5,
    MobilePayment = 6,
    ElectronicWallet = 7
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.Cash]: 'Efectivo',
    [PaymentMethod.CreditCard]: 'Tarjeta de Crédito',
    [PaymentMethod.DebitCard]: 'Tarjeta de Débito',
    [PaymentMethod.BankTransfer]: 'Transferencia Bancaria',
    [PaymentMethod.Check]: 'Cheque',
    [PaymentMethod.MobilePayment]: 'Pago Móvil',
    [PaymentMethod.ElectronicWallet]: 'Billetera Electrónica'
};
