using AutoMapper;
using InvoiceSystem.Application.DTOs.Customers;
using InvoiceSystem.Application.DTOs.Invoices;
using InvoiceSystem.Application.DTOs.Products;
using InvoiceSystem.Application.DTOs.Sellers;
using InvoiceSystem.Domain.Entities;

namespace InvoiceSystem.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Customer
        CreateMap<Customer, CustomerDto>();
        CreateMap<CreateCustomerRequest, Customer>();
        CreateMap<UpdateCustomerRequest, Customer>();

        // Seller
        CreateMap<Seller, SellerDto>();
        CreateMap<CreateSellerRequest, Seller>();
        CreateMap<UpdateSellerRequest, Seller>();

        // Product
        CreateMap<Product, ProductDto>();
        CreateMap<CreateProductRequest, Product>();
        CreateMap<UpdateProductRequest, Product>();

        // Invoice
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.Name))
            .ForMember(dest => dest.CustomerIdentification, opt => opt.MapFrom(src => src.Customer.Identification))
            .ForMember(dest => dest.SellerName, opt => opt.MapFrom(src => src.Seller.Name))
            .ForMember(dest => dest.TotalPaid, opt => opt.MapFrom(src => 
                src.Payments.Where(p => !p.IsVoided).Sum(p => p.Amount)));

        // InvoiceDetail
        CreateMap<InvoiceDetail, InvoiceDetailDto>()
            .ForMember(dest => dest.ProductCode, opt => opt.MapFrom(src => src.Product.Code))
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name));

        // InvoicePayment
        CreateMap<InvoicePayment, InvoicePaymentDto>();
        CreateMap<CreateInvoicePaymentRequest, InvoicePayment>();
    }
}