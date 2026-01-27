using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Invoices;

namespace InvoiceSystem.Application.Services.Interfaces;

public interface IInvoiceService
{
    Task<Result<PagedResult<InvoiceDto>>> GetAllAsync(InvoiceFilterRequest filter, CancellationToken cancellationToken = default);
    Task<Result<InvoiceDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<InvoiceDto>> CreateAsync(CreateInvoiceRequest request, CancellationToken cancellationToken = default);
    Task<Result<bool>> CancelAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<InvoicePaymentDto>> AddPaymentAsync(Guid invoiceId, CreateInvoicePaymentRequest request, CancellationToken cancellationToken = default);
}