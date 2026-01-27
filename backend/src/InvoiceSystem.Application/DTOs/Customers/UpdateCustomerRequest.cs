using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Application.DTOs.Customers;

public class UpdateCustomerRequest
{
    public IdentificationType IdentificationType { get; set; }
    public string Identification { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
}