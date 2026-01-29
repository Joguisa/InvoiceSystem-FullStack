using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Application.DTOs.Invoices;

public class CreateInvoicePaymentRequest
{
    public PaymentMethod PaymentMethod { get; set; }
    public decimal Amount { get; set; }
    public string? Reference { get; set; }
    public string? CardLastFourDigits { get; set; }
    public string? BankName { get; set; }
    public int? Installments { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }
}