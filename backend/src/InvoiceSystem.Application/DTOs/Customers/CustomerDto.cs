using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Application.DTOs.Customers;

public class CustomerDto
{
    public Guid Id { get; set; }
    public IdentificationType IdentificationType { get; set; }
    public string IdentificationTypeName => IdentificationType.ToString();
    public string Identification { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}