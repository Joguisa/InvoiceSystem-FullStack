using InvoiceSystem.Domain.Entities;

namespace InvoiceSystem.Application.Common.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Customer> Customers { get; }
    IRepository<Seller> Sellers { get; }
    IRepository<Product> Products { get; }
    IRepository<Invoice> Invoices { get; }
    IRepository<InvoiceDetail> InvoiceDetails { get; }
    IRepository<InvoicePayment> InvoicePayments { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}