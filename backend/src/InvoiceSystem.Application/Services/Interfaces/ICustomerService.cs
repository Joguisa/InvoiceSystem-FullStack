using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Customers;

namespace InvoiceSystem.Application.Services.Interfaces;

public interface ICustomerService
{
    Task<Result<IEnumerable<CustomerDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<CustomerDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<CustomerDto>> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default);
    Task<Result<CustomerDto>> UpdateAsync(Guid id, UpdateCustomerRequest request, CancellationToken cancellationToken = default);
    Task<Result<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}