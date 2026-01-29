using InvoiceSystem.API.Middleware;
using InvoiceSystem.Infrastructure.Data;

namespace InvoiceSystem.API.Extensions;

public static class ApplicationBuilderExtensions
{
    public static async Task<WebApplication> ConfigurePipelineAsync(this WebApplication app)
    {
        // Seed
        await DbSeeder.SeedAsync(app.Services);

        // Exception handling
        app.UseMiddleware<ExceptionHandlingMiddleware>();

        // Swagger
        //if (app.Environment.IsDevelopment())
        //{
            app.UseSwagger();
            app.UseSwaggerUI();
        //}

        app.UseHttpsRedirection();
        app.UseCors("AllowAngular");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        return app;
    }
}