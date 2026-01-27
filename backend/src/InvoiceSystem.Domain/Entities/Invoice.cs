using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Domain.Entities;

public class Invoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    
    // Foreign Keys
    public Guid CustomerId { get; set; }
    public Guid SellerId { get; set; }
    
    // Totals
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; } = 15.00m; // IVA Ecuador
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    
    // Status
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public string? Notes { get; set; }

    // Navigation
    public virtual Customer Customer { get; set; } = null!;
    public virtual Seller Seller { get; set; } = null!;
    public virtual ICollection<InvoiceDetail> Details { get; set; } = new List<InvoiceDetail>();
    public virtual ICollection<InvoicePayment> Payments { get; set; } = new List<InvoicePayment>();
}