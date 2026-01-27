using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Domain.Entities;

public class InvoicePayment
{
    public Guid Id { get; set; }
    
    // Foreign Key
    public Guid InvoiceId { get; set; }
    
    // Payment Info
    public PaymentMethod PaymentMethod { get; set; }
    public decimal Amount { get; set; }
    public string? Reference { get; set; } // Nro. transacción, autorización, etc.
    public string? CardLastFourDigits { get; set; } // Para tarjetas: "1234"
    public string? BankName { get; set; } // Para transferencias/cheques
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public bool IsVoided { get; set; } // Anulación sin eliminar registro

    // Navigation
    public virtual Invoice Invoice { get; set; } = null!;
}