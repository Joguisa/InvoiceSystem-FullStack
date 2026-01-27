namespace InvoiceSystem.Application.DTOs.Invoices;

public class CreateInvoiceRequest
{
    public Guid CustomerId { get; set; }
    public Guid SellerId { get; set; }
    public DateTime IssueDate { get; set; }
    public string? Notes { get; set; }
    
    public List<CreateInvoiceDetailRequest> Details { get; set; } = new();
    public List<CreateInvoicePaymentRequest> Payments { get; set; } = new();
}