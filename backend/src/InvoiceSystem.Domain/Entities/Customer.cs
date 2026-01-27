using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Domain.Entities;

public class Customer : BaseEntity
{
    public IdentificationType IdentificationType { get; set; }
    public string Identification { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }

    // Navigation
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}