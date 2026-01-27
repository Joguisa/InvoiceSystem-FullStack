namespace InvoiceSystem.Domain.Entities;

public class InvoiceDetail
{
    public Guid Id { get; set; }
    
    // Foreign Keys
    public Guid InvoiceId { get; set; }
    public Guid ProductId { get; set; }
    
    // Detail
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; } // Precio al momento de facturar
    public decimal Discount { get; set; }
    public decimal LineTotal { get; set; }
    
    public DateTime CreatedAt { get; set; }

    // Navigation
    public virtual Invoice Invoice { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
}