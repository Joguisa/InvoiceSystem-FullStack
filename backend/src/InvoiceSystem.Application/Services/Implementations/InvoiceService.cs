using AutoMapper;
using InvoiceSystem.Application.Common.Interfaces;
using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Invoices;
using InvoiceSystem.Application.Services.Interfaces;
using InvoiceSystem.Domain.Entities;
using InvoiceSystem.Domain.Enums;

namespace InvoiceSystem.Application.Services.Implementations;

public class InvoiceService : IInvoiceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private const decimal TAX_RATE = 15.00m;

    public InvoiceService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<InvoiceDto>>> GetAllAsync(InvoiceFilterRequest filter, CancellationToken cancellationToken = default)
    {
        var invoices = await _unitOfWork.Invoices.FindWithIncludesAsync(i => i.IsActive, new[] { "Seller", "Customer", "Payments" }, cancellationToken);
        var query = invoices.AsQueryable();

        if (!string.IsNullOrEmpty(filter.InvoiceNumber))
            query = query.Where(i => i.InvoiceNumber.Contains(filter.InvoiceNumber));

        if (filter.FromDate.HasValue)
            query = query.Where(i => i.IssueDate >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(i => i.IssueDate <= filter.ToDate.Value);

        if (filter.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == filter.CustomerId.Value);

        if (filter.SellerId.HasValue)
            query = query.Where(i => i.SellerId == filter.SellerId.Value);

        if (filter.Status.HasValue)
            query = query.Where(i => i.Status == filter.Status.Value);

        if (filter.MinAmount.HasValue)
            query = query.Where(i => i.Total >= filter.MinAmount.Value);

        if (filter.MaxAmount.HasValue)
            query = query.Where(i => i.Total <= filter.MaxAmount.Value);

        var totalCount = query.Count();
        var items = query
            .OrderByDescending(i => i.IssueDate)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var dtos = _mapper.Map<List<InvoiceDto>>(items);
        var pagedResult = new PagedResult<InvoiceDto>(dtos, totalCount, filter.Page, filter.PageSize);

        return Result<PagedResult<InvoiceDto>>.Success(pagedResult);
    }

    public async Task<Result<InvoiceDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var invoice = await _unitOfWork.Invoices.GetByIdWithIncludesAsync(id, new[] { "Details.Product", "Payments", "Seller", "Customer" }, cancellationToken);
        
        if (invoice == null || !invoice.IsActive)
            return Result<InvoiceDto>.Failure("Factura no encontrada");

        var dto = _mapper.Map<InvoiceDto>(invoice);
        return Result<InvoiceDto>.Success(dto);
    }

    public async Task<Result<InvoiceDto>> CreateAsync(CreateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerId, cancellationToken);
            if (customer == null || !customer.IsActive)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result<InvoiceDto>.Failure("Cliente no encontrado o inactivo");
            }

            var seller = await _unitOfWork.Sellers.GetByIdAsync(request.SellerId, cancellationToken);
            if (seller == null || !seller.IsActive)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result<InvoiceDto>.Failure("Vendedor no encontrado o inactivo");
            }

            if (!request.Details.Any())
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result<InvoiceDto>.Failure("La factura debe tener al menos un detalle");
            }

            var invoiceNumber = await GenerateInvoiceNumberAsync(cancellationToken);

            var invoice = new Invoice
            {
                InvoiceNumber = invoiceNumber,
                IssueDate = request.IssueDate,
                CustomerId = request.CustomerId,
                SellerId = request.SellerId,
                CustomerName = customer.Name,
                CustomerIdentification = customer.Identification,
                CustomerPhone = customer.Phone,
                CustomerEmail = customer.Email,
                TaxRate = TAX_RATE,
                Notes = request.Notes,
                Status = InvoiceStatus.Draft
            };

            decimal subtotal = 0;

            foreach (var detailRequest in request.Details)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(detailRequest.ProductId, cancellationToken);
                if (product == null || !product.IsActive)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result<InvoiceDto>.Failure($"Producto no encontrado o inactivo");
                }

                if (product.Stock < detailRequest.Quantity)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result<InvoiceDto>.Failure($"Stock insuficiente para el producto {product.Name}");
                }

                var lineTotal = (product.UnitPrice * detailRequest.Quantity) - detailRequest.Discount;
                
                if (lineTotal < 0)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result<InvoiceDto>.Failure($"El descuento no puede ser mayor al total para el producto {product.Name}");
                }
                
                var detail = new InvoiceDetail
                {
                    InvoiceId = invoice.Id,
                    ProductId = product.Id,
                    Quantity = detailRequest.Quantity,
                    UnitPrice = product.UnitPrice, // Precio histórico
                    Discount = detailRequest.Discount,
                    LineTotal = lineTotal,
                    CreatedAt = DateTime.UtcNow
                };

                invoice.Details.Add(detail);
                subtotal += lineTotal;

                product.Stock -= detailRequest.Quantity;
                _unitOfWork.Products.Update(product);
            }

            invoice.Subtotal = subtotal;
            invoice.TaxAmount = subtotal * (TAX_RATE / 100);
            invoice.Total = subtotal + invoice.TaxAmount;
            decimal totalPaid = 0;
            foreach (var paymentRequest in request.Payments)
            {
                var payment = new InvoicePayment
                {
                    InvoiceId = invoice.Id,
                    PaymentMethod = paymentRequest.PaymentMethod,
                    Amount = paymentRequest.Amount,
                    Reference = paymentRequest.Reference,
                    CardLastFourDigits = paymentRequest.CardLastFourDigits,
                    BankName = paymentRequest.BankName,
                    Installments = paymentRequest.Installments,
                    PaymentDate = paymentRequest.PaymentDate,
                    Notes = paymentRequest.Notes,
                    CreatedAt = DateTime.UtcNow
                };

                invoice.Payments.Add(payment);
                totalPaid += paymentRequest.Amount;
            }

            invoice.Status = DetermineInvoiceStatus(invoice.Total, totalPaid);

            await _unitOfWork.Invoices.AddAsync(invoice, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            var dto = _mapper.Map<InvoiceDto>(invoice);
            return Result<InvoiceDto>.Success(dto);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return Result<InvoiceDto>.Failure($"Error al crear la factura: {ex.Message}");
        }
    }

    public async Task<Result<bool>> CancelAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var invoice = await _unitOfWork.Invoices.GetByIdWithIncludesAsync(id, new[] { "Details", "Details.Product" }, cancellationToken);
        
        if (invoice == null || !invoice.IsActive)
            return Result<bool>.Failure("Factura no encontrada");

        if (invoice.Status == InvoiceStatus.Cancelled)
            return Result<bool>.Failure("La factura ya está cancelada");

        foreach (var detail in invoice.Details)
        {
            if (detail.Product != null)
            {
                detail.Product.Stock += detail.Quantity;
                _unitOfWork.Products.Update(detail.Product);
            }
        }

        invoice.Status = InvoiceStatus.Cancelled;
        _unitOfWork.Invoices.Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<InvoicePaymentDto>> AddPaymentAsync(Guid invoiceId, CreateInvoicePaymentRequest request, CancellationToken cancellationToken = default)
    {
        var invoice = await _unitOfWork.Invoices.GetByIdWithIncludesAsync(invoiceId, new[] { "Payments" }, cancellationToken);
        
        if (invoice == null || !invoice.IsActive)
            return Result<InvoicePaymentDto>.Failure("Factura no encontrada");

        if (invoice.Status == InvoiceStatus.Cancelled)
            return Result<InvoicePaymentDto>.Failure("No se puede agregar pago a una factura cancelada");

        if (invoice.Status == InvoiceStatus.Paid)
            return Result<InvoicePaymentDto>.Failure("La factura ya está pagada completamente");

        var payment = new InvoicePayment
        {
            InvoiceId = invoiceId,
            PaymentMethod = request.PaymentMethod,
            Amount = request.Amount,
            Reference = request.Reference,
            CardLastFourDigits = request.CardLastFourDigits,
            BankName = request.BankName,
            Installments = request.Installments,
            PaymentDate = request.PaymentDate,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.InvoicePayments.AddAsync(payment, cancellationToken);

        var totalPaid = invoice.Payments.Where(p => !p.IsVoided).Sum(p => p.Amount) + request.Amount;
        invoice.Status = DetermineInvoiceStatus(invoice.Total, totalPaid);
        _unitOfWork.Invoices.Update(invoice);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<InvoicePaymentDto>(payment);
        return Result<InvoicePaymentDto>.Success(dto);
    }

    private async Task<string> GenerateInvoiceNumberAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var count = await _unitOfWork.Invoices.CountAsync(
            i => i.CreatedAt.Year == year, cancellationToken);
        
        return $"FAC-{year}-{(count + 1):D6}";
    }

    private static InvoiceStatus DetermineInvoiceStatus(decimal total, decimal totalPaid)
    {
        if (totalPaid <= 0)
            return InvoiceStatus.Issued;
        
        if (totalPaid >= total)
            return InvoiceStatus.Paid;
        
        return InvoiceStatus.PartiallyPaid;
    }
}