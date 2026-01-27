using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Products;

namespace InvoiceSystem.Application.Services.Interfaces;

public interface IProductService
{
    Task<Result<IEnumerable<ProductDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<ProductDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<ProductDto>> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
    Task<Result<ProductDto>> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default);
    Task<Result<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}