using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Application.DTOs.Invoices;

public class InvoicePaymentDto
{
    public Guid Id { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string PaymentMethodName => PaymentMethod.ToString();
    public decimal Amount { get; set; }
    public string? Reference { get; set; }
    public string? CardLastFourDigits { get; set; }
    public string? BankName { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }
    public bool IsVoided { get; set; }
}