using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Application.DTOs.Invoices;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    
    // Customer
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerIdentification { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    
    // Seller
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    
    // Totals
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal PendingAmount => Total - TotalPaid;
    
    // Status
    public InvoiceStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    // Details and Payments
    public List<InvoiceDetailDto> Details { get; set; } = new();
    public List<InvoicePaymentDto> Payments { get; set; } = new();
}