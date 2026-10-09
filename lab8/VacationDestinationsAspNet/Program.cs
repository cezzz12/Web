using System.Text;
using VacationDestinationsAspNet.Data;
using VacationDestinationsAspNet.Models;
using VacationDestinationsAspNet.Services;
using VacationDestinationsAspNet.Ui;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return false;
                }

                return uri.Scheme is "http" or "https" &&
                       (uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                        uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase));
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".VacationDestinations.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.IdleTimeout = TimeSpan.FromHours(8);
});
builder.Services.AddSingleton<SqlDestinationRepository>();

var app = builder.Build();

var connectionString = builder.Configuration.GetConnectionString("VacationDatabase")
    ?? throw new InvalidOperationException("Missing the VacationDatabase connection string.");
var seedUsername = builder.Configuration["SeedUser:Username"] ?? "traveladmin";
var seedPassword = builder.Configuration["SeedUser:Password"] ?? "Travel123!";
await DatabaseInitializer.EnsureDatabaseAsync(connectionString, seedUsername, seedPassword);

app.UseCors();
app.UseSession();

app.Use(async (context, next) =>
{
    if (IsPublicPath(context.Request.Path))
    {
        await next();
        return;
    }

    if (IsAuthenticated(context))
    {
        await next();
        return;
    }

    if (context.Request.Path.StartsWithSegments("/api"))
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(new
        {
            success = false,
            message = "Authentication required.",
            authenticated = false,
        });
        return;
    }

    var returnUrl = $"{context.Request.PathBase}{context.Request.Path}{context.Request.QueryString}";
    context.Response.Redirect($"/login?returnUrl={Uri.EscapeDataString(returnUrl)}");
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/login", (HttpContext context, string? returnUrl) =>
{
    if (IsAuthenticated(context))
    {
        return Results.Redirect("/");
    }

    var safeReturnUrl = NormalizeReturnUrl(returnUrl);
    return TypedResults.Content(
        LoginPageRenderer.Render(safeReturnUrl),
        "text/html; charset=utf-8",
        Encoding.UTF8);
});

app.MapPost("/login", async (HttpContext context, SqlDestinationRepository repository) =>
{
    var form = await context.Request.ReadFormAsync();
    var username = form["username"].ToString().Trim();
    var password = form["password"].ToString();
    var safeReturnUrl = NormalizeReturnUrl(form["returnUrl"].ToString());

    var fieldErrors = new Dictionary<string, string>();
    if (username.Length < 3)
    {
        fieldErrors["username"] = "Username must contain at least 3 characters.";
    }
    else if (username.Length > 60)
    {
        fieldErrors["username"] = "Username cannot exceed 60 characters.";
    }

    if (password.Length < 6)
    {
        fieldErrors["password"] = "Password must contain at least 6 characters.";
    }
    else if (password.Length > 100)
    {
        fieldErrors["password"] = "Password cannot exceed 100 characters.";
    }

    if (fieldErrors.Count > 0)
    {
        return TypedResults.Content(
            LoginPageRenderer.Render(safeReturnUrl, username, "Please fix the highlighted login fields.", fieldErrors),
            "text/html; charset=utf-8",
            Encoding.UTF8,
            StatusCodes.Status422UnprocessableEntity);
    }

    var user = await repository.AuthenticateAsync(username, password);
    if (user is null)
    {
        return TypedResults.Content(
            LoginPageRenderer.Render(safeReturnUrl, username, "Invalid username or password."),
            "text/html; charset=utf-8",
            Encoding.UTF8,
            StatusCodes.Status401Unauthorized);
    }

    context.Session.SetInt32("user_id", user.Id);
    context.Session.SetString("username", user.Username);
    return Results.Redirect(safeReturnUrl);
});

app.MapMethods("/logout", new[] { "GET", "POST" }, (HttpContext context) =>
{
    context.Session.Clear();
    return Results.Redirect("/login");
});

app.MapGet("/api/session.php", (HttpContext context) =>
{
    var username = context.Session.GetString("username");
    if (string.IsNullOrWhiteSpace(username))
    {
        return Results.Json(new
        {
            success = false,
            authenticated = false,
            message = "Authentication required.",
        }, statusCode: StatusCodes.Status401Unauthorized);
    }

    return Results.Json(new
    {
        success = true,
        authenticated = true,
        username,
    });
});

app.MapPost("/api/logout.php", (HttpContext context) =>
{
    context.Session.Clear();
    return Results.Json(new
    {
        success = true,
        authenticated = false,
        message = "Logged out.",
    });
});

app.MapGet("/api/countries.php", async (SqlDestinationRepository repository) =>
{
    try
    {
        var countries = await repository.GetCountriesAsync();
        return Results.Json(new
        {
            success = true,
            countries = countries.Select(country => country.ToApiModel()),
        });
    }
    catch
    {
        return Results.Json(new
        {
            success = false,
            message = "Could not load countries.",
        }, statusCode: StatusCodes.Status500InternalServerError);
    }
});

app.MapGet("/api/destinations.php", async (SqlDestinationRepository repository, string? country, int? page) =>
{
    try
    {
        var requestedPage = page.GetValueOrDefault(1);
        var result = await repository.GetDestinationsAsync(country ?? string.Empty, requestedPage > 0 ? requestedPage : 1, 4);

        return Results.Json(new
        {
            success = true,
            destinations = result.Destinations.Select(destination => destination.ToApiModel()),
            pagination = new
            {
                page = result.Page,
                per_page = result.PerPage,
                total = result.Total,
                total_pages = result.TotalPages,
                has_previous = result.Page > 1,
                has_next = result.Page < result.TotalPages,
            },
            country = (country ?? string.Empty).Trim(),
        });
    }
    catch
    {
        return Results.Json(new
        {
            success = false,
            message = "Could not process request.",
        }, statusCode: StatusCodes.Status500InternalServerError);
    }
});

app.MapPost("/api/destinations.php", async (DestinationInput input, SqlDestinationRepository repository) =>
{
    try
    {
        var (destination, errors) = DestinationValidator.Validate(input);
        if (errors.Count > 0 || destination is null)
        {
            return Results.Json(new
            {
                success = false,
                message = "Please check the form fields.",
                errors,
            }, statusCode: StatusCodes.Status422UnprocessableEntity);
        }

        var id = await repository.CreateDestinationAsync(destination);
        var createdDestination = await repository.FindDestinationAsync(id);

        return Results.Json(new
        {
            success = true,
            message = "Destination added.",
            destination = createdDestination?.ToApiModel(),
        }, statusCode: StatusCodes.Status201Created);
    }
    catch
    {
        return Results.Json(new
        {
            success = false,
            message = "Could not process request.",
        }, statusCode: StatusCodes.Status500InternalServerError);
    }
});

app.MapPut("/api/destinations.php", async (HttpRequest request, DestinationInput input, SqlDestinationRepository repository) =>
{
    try
    {
        if (!TryGetPositiveId(request.Query["id"], out var id))
        {
            return Results.Json(new
            {
                success = false,
                message = "Destination not found.",
            }, statusCode: StatusCodes.Status404NotFound);
        }

        var existingDestination = await repository.FindDestinationAsync(id);
        if (existingDestination is null)
        {
            return Results.Json(new
            {
                success = false,
                message = "Destination not found.",
            }, statusCode: StatusCodes.Status404NotFound);
        }

        var (destination, errors) = DestinationValidator.Validate(input);
        if (errors.Count > 0 || destination is null)
        {
            return Results.Json(new
            {
                success = false,
                message = "Please check the form fields.",
                errors,
            }, statusCode: StatusCodes.Status422UnprocessableEntity);
        }

        await repository.UpdateDestinationAsync(id, destination);
        var updatedDestination = await repository.FindDestinationAsync(id);

        return Results.Json(new
        {
            success = true,
            message = "Destination updated.",
            destination = updatedDestination?.ToApiModel(),
        });
    }
    catch
    {
        return Results.Json(new
        {
            success = false,
            message = "Could not process request.",
        }, statusCode: StatusCodes.Status500InternalServerError);
    }
});

app.MapDelete("/api/destinations.php", async (HttpRequest request, SqlDestinationRepository repository) =>
{
    try
    {
        if (!TryGetPositiveId(request.Query["id"], out var id))
        {
            return Results.Json(new
            {
                success = false,
                message = "Destination not found.",
            }, statusCode: StatusCodes.Status404NotFound);
        }

        var existingDestination = await repository.FindDestinationAsync(id);
        if (existingDestination is null)
        {
            return Results.Json(new
            {
                success = false,
                message = "Destination not found.",
            }, statusCode: StatusCodes.Status404NotFound);
        }

        await repository.DeleteDestinationAsync(id);
        return Results.Json(new
        {
            success = true,
            message = "Destination deleted.",
        });
    }
    catch
    {
        return Results.Json(new
        {
            success = false,
            message = "Could not process request.",
        }, statusCode: StatusCodes.Status500InternalServerError);
    }
});

app.Run();

static bool IsAuthenticated(HttpContext context) =>
    !string.IsNullOrWhiteSpace(context.Session.GetString("username"));

static bool IsPublicPath(PathString path) =>
    path.Equals("/login", StringComparison.OrdinalIgnoreCase) ||
    path.Equals("/logout", StringComparison.OrdinalIgnoreCase) ||
    path.Equals("/favicon.ico", StringComparison.OrdinalIgnoreCase) ||
    path.Equals("/api/session.php", StringComparison.OrdinalIgnoreCase) ||
    path.Equals("/api/logout.php", StringComparison.OrdinalIgnoreCase);

static string NormalizeReturnUrl(string? returnUrl)
{
    if (string.IsNullOrWhiteSpace(returnUrl))
    {
        return "/";
    }

    if (returnUrl.StartsWith('/'))
    {
        return returnUrl;
    }

    if (Uri.TryCreate(returnUrl, UriKind.Absolute, out var absoluteUri) &&
        (absoluteUri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
         absoluteUri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase)))
    {
        return absoluteUri.ToString();
    }

    return "/";
}

static bool TryGetPositiveId(string? rawValue, out int id)
{
    if (int.TryParse(rawValue, out id) && id > 0)
    {
        return true;
    }

    id = 0;
    return false;
}
