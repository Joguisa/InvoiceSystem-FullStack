using AutoMapper;
using InvoiceSystem.Application.Common.Interfaces;
using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Customers;
using InvoiceSystem.Application.Services.Interfaces;
using InvoiceSystem.Domain.Entities;

namespace InvoiceSystem.Application.Services.Implementations;

public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CustomerService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<IEnumerable<CustomerDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var customers = await _unitOfWork.Customers.FindAsync(c => c.IsActive, cancellationToken);
        var dtos = _mapper.Map<IEnumerable<CustomerDto>>(customers);
        return Result<IEnumerable<CustomerDto>>.Success(dtos);
    }

    public async Task<Result<CustomerDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken);
        
        if (customer == null || !customer.IsActive)
            return Result<CustomerDto>.Failure("Cliente no encontrado");

        var dto = _mapper.Map<CustomerDto>(customer);
        return Result<CustomerDto>.Success(dto);
    }

    public async Task<Result<CustomerDto>> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var exists = await _unitOfWork.Customers.ExistsAsync(
            c => c.Identification == request.Identification, cancellationToken);
        
        if (exists)
            return Result<CustomerDto>.Failure("Ya existe un cliente con esta identificación");

        var customer = _mapper.Map<Customer>(request);
        await _unitOfWork.Customers.AddAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<CustomerDto>(customer);
        return Result<CustomerDto>.Success(dto);
    }

    public async Task<Result<CustomerDto>> UpdateAsync(Guid id, UpdateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken);
        
        if (customer == null || !customer.IsActive)
            return Result<CustomerDto>.Failure("Cliente no encontrado");

        if (customer.Identification != request.Identification)
        {
            var exists = await _unitOfWork.Customers.ExistsAsync(
                c => c.Identification == request.Identification && c.Id != id, cancellationToken);
            
            if (exists)
                return Result<CustomerDto>.Failure("Ya existe un cliente con esta identificación");
        }

        _mapper.Map(request, customer);
        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<CustomerDto>(customer);
        return Result<CustomerDto>.Success(dto);
    }

    public async Task<Result<bool>> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken);
        
        if (customer == null || !customer.IsActive)
            return Result<bool>.Failure("Cliente no encontrado");

        customer.IsActive = false;
        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}