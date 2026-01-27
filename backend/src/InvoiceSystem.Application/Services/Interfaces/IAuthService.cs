using InvoiceSystem.Application.Common.Models;
using InvoiceSystem.Application.DTOs.Auth;

namespace InvoiceSystem.Application.Services.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    string HashPassword(string password);
}
