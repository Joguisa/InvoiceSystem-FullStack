using InvoiceSystem.Application.Common.Interfaces;
using InvoiceSystem.Domain.Entities;
using InvoiceSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace InvoiceSystem.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;
    
    private IRepository<Customer>? _customers;
    private IRepository<Seller>? _sellers;
    private IRepository<Product>? _products;
    private IRepository<Invoice>? _invoices;
    private IRepository<InvoiceDetail>? _invoiceDetails;
    private IRepository<InvoicePayment>? _invoicePayments;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<Customer> Customers => 
        _customers ??= new Repository<Customer>(_context);

    public IRepository<Seller> Sellers => 
        _sellers ??= new Repository<Seller>(_context);

    public IRepository<Product> Products => 
        _products ??= new Repository<Product>(_context);

    public IRepository<Invoice> Invoices => 
        _invoices ??= new Repository<Invoice>(_context);

    public IRepository<InvoiceDetail> InvoiceDetails => 
        _invoiceDetails ??= new Repository<InvoiceDetail>(_context);

    public IRepository<InvoicePayment> InvoicePayments => 
        _invoicePayments ??= new Repository<InvoicePayment>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}