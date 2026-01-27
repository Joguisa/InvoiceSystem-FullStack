using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Sellers;

namespace InvoiceSystem.Application.Services.Interfaces;

public interface ISellerService
{
    Task<Result<IEnumerable<SellerDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<SellerDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<SellerDto>> CreateAsync(CreateSellerRequest request, CancellationToken cancellationToken = default);
    Task<Result<SellerDto>> UpdateAsync(Guid id, UpdateSellerRequest request, CancellationToken cancellationToken = default);
    Task<Result<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}