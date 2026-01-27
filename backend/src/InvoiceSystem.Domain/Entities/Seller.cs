namespace InvoiceSystem.Domain.Entities;

public class Seller : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }

    // Navigation
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}