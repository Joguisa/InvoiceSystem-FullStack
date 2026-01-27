namespace InvoiceSystem.Application.Common.Models;

public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Data { get; }
    public string? Error { get; }
    public List<string> Errors { get; } = new();

    private Result(bool isSuccess, T? data, string? error)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
    }

    private Result(bool isSuccess, T? data, List<string> errors)
    {
        IsSuccess = isSuccess;
        Data = data;
        Errors = errors;
        Error = errors.FirstOrDefault();
    }

    public static Result<T> Success(T data) => new(true, data, (string?)null);
    public static Result<T> Failure(string error) => new(false, default, error);
    public static Result<T> Failure(List<string> errors) => new(false, default, errors);
}