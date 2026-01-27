using InvoiceSystem.Application.Common.Mappings;
using InvoiceSystem.Application.Services.Implementations;
using InvoiceSystem.Application.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace InvoiceSystem.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(typeof(MappingProfile));

        // Services
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ISellerService, SellerService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IInvoiceService, InvoiceService>();

        return services;
    }
}