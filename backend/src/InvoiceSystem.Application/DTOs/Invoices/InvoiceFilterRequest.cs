using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Application.DTOs.Invoices;

public class InvoiceFilterRequest
{
    public string? InvoiceNumber { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? SellerId { get; set; }
    public InvoiceStatus? Status { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}