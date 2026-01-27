using InvoiceSystem.Application.Services.Interfaces;
using InvoiceSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace InvoiceSystem.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

        await SeedAdminUserAsync(context, authService);
    }

    private static async Task SeedAdminUserAsync(ApplicationDbContext context, IAuthService authService)
    {
        var adminUsername = "admin";

        var adminExists = await context.Users.AnyAsync(u => u.Username == adminUsername);
        if (adminExists)
            return;

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Username = adminUsername,
            PasswordHash = authService.HashPassword("admin"),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();
    }
}
