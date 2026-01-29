using AutoMapper;
using InvoiceSystem.Application.Common.Interfaces;
using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Sellers;
using InvoiceSystem.Application.Services.Interfaces;
using InvoiceSystem.Domain.Entities;

namespace InvoiceSystem.Application.Services.Implementations;

public class SellerService : ISellerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SellerService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<SellerDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var sellers = await _unitOfWork.Sellers.FindAsync(s => s.IsActive, cancellationToken);
        var dtos = _mapper.Map<IEnumerable<SellerDto>>(sellers);
        return Result<IEnumerable<SellerDto>>.Success(dtos);
    }

    public async Task<Result<SellerDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var seller = await _unitOfWork.Sellers.GetByIdAsync(id, cancellationToken);
        
        if (seller == null || !seller.IsActive)
            return Result<SellerDto>.Failure("Vendedor no encontrado");

        var dto = _mapper.Map<SellerDto>(seller);
        return Result<SellerDto>.Success(dto);
    }

    public async Task<Result<SellerDto>> CreateAsync(CreateSellerRequest request, CancellationToken cancellationToken = default)
    {
        var sellers = await _unitOfWork.Sellers.FindAsync(s => s.Code == request.Code, cancellationToken);
        var existing = sellers.FirstOrDefault();
        
        if (existing != null)
        {
            if (existing.IsActive)
                return Result<SellerDto>.Failure("Ya existe un vendedor activo con este código");
                
            _mapper.Map(request, existing);
            existing.IsActive = true;
            
            _unitOfWork.Sellers.Update(existing);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return Result<SellerDto>.Success(_mapper.Map<SellerDto>(existing));
        }

        var seller = _mapper.Map<Seller>(request);
        await _unitOfWork.Sellers.AddAsync(seller, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SellerDto>(seller);
        return Result<SellerDto>.Success(dto);
    }

    public async Task<Result<SellerDto>> UpdateAsync(Guid id, UpdateSellerRequest request, CancellationToken cancellationToken = default)
    {
        var seller = await _unitOfWork.Sellers.GetByIdAsync(id, cancellationToken);
        
        if (seller == null || !seller.IsActive)
            return Result<SellerDto>.Failure("Vendedor no encontrado");

        if (seller.Code != request.Code)
        {
            var exists = await _unitOfWork.Sellers.ExistsAsync(
                s => s.Code == request.Code && s.Id != id, cancellationToken);
            
            if (exists)
                return Result<SellerDto>.Failure("Ya existe un vendedor con este código");
        }

        _mapper.Map(request, seller);
        _unitOfWork.Sellers.Update(seller);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SellerDto>(seller);
        return Result<SellerDto>.Success(dto);
    }

    public async Task<Result<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var seller = await _unitOfWork.Sellers.GetByIdAsync(id, cancellationToken);
        
        if (seller == null || !seller.IsActive)
            return Result<bool>.Failure("Vendedor no encontrado");

        seller.IsActive = false;
        _unitOfWork.Sellers.Update(seller);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}