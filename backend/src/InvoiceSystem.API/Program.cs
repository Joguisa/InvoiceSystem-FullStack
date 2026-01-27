using InvoiceSystem.Application;
using InvoiceSystem.Infrastructure;
using InvoiceSystem.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerConfiguration();
builder.Services.AddCorsConfiguration();

// Layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Pipeline
await app.ConfigurePipelineAsync();

app.Run();