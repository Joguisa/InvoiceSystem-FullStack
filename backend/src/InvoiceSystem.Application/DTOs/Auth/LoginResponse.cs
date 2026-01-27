namespace InvoiceSystem.Application.DTOs.Auth;

public record LoginResponse(string Token, DateTime ExpiresAt);
