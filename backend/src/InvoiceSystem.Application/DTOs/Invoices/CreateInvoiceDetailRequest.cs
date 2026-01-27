namespace InvoiceSystem.Application.DTOs.Invoices;

public class CreateInvoiceDetailRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Discount { get; set; }
}