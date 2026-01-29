using AutoMapper;
using InvoiceSystem.Application.Common.Interfaces;
using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Products;
using InvoiceSystem.Application.Services.Interfaces;
using InvoiceSystem.Domain.Entities;

namespace InvoiceSystem.Application.Services.Implementations;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<ProductDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var products = await _unitOfWork.Products.FindAsync(p => p.IsActive, cancellationToken);
        var dtos = _mapper.Map<IEnumerable<ProductDto>>(products);
        return Result<IEnumerable<ProductDto>>.Success(dtos);
    }

    public async Task<Result<ProductDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        
        if (product == null || !product.IsActive)
            return Result<ProductDto>.Failure("Producto no encontrado");

        var dto = _mapper.Map<ProductDto>(product);
        return Result<ProductDto>.Success(dto);
    }

    public async Task<Result<ProductDto>> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        var products = await _unitOfWork.Products.FindAsync(p => p.Code == request.Code, cancellationToken);
        var existingProduct = products.FirstOrDefault();
        
        if (existingProduct != null)
        {
            if (existingProduct.IsActive)
                return Result<ProductDto>.Failure("Ya existe un producto activo con este código");
                
            _mapper.Map(request, existingProduct);
            existingProduct.IsActive = true;
            
            _unitOfWork.Products.Update(existingProduct);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return Result<ProductDto>.Success(_mapper.Map<ProductDto>(existingProduct));
        }

        var product = _mapper.Map<Product>(request);
        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<ProductDto>(product);
        return Result<ProductDto>.Success(dto);
    }

    public async Task<Result<ProductDto>> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        
        if (product == null || !product.IsActive)
            return Result<ProductDto>.Failure("Producto no encontrado");

        if (product.Code != request.Code)
        {
            var exists = await _unitOfWork.Products.ExistsAsync(
                p => p.Code == request.Code && p.Id != id, cancellationToken);
            
            if (exists)
                return Result<ProductDto>.Failure("Ya existe un producto con este código");
        }

        _mapper.Map(request, product);
        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<ProductDto>(product);
        return Result<ProductDto>.Success(dto);
    }

    public async Task<Result<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        
        if (product == null || !product.IsActive)
            return Result<bool>.Failure("Producto no encontrado");

        product.IsActive = false;
        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}