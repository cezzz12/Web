using Microsoft.Data.SqlClient;
using VacationDestinationsAspNet.Models;
using VacationDestinationsAspNet.Services;

namespace VacationDestinationsAspNet.Data;

public sealed class SqlDestinationRepository
{
    private readonly string _connectionString;

    public SqlDestinationRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("VacationDatabase")
            ?? throw new InvalidOperationException("Missing the VacationDatabase connection string.");
    }

    public async Task<AuthenticatedUser?> AuthenticateAsync(string username, string password)
    {
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT TOP (1) id, username, password_hash
            FROM dbo.app_users
            WHERE username = @username
            """;
        command.Parameters.Add(new SqlParameter("@username", username));

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return null;
        }

        var passwordHash = reader.GetString(2);
        if (!PasswordHasher.VerifyPassword(password, passwordHash))
        {
            return null;
        }

        return new AuthenticatedUser(reader.GetInt32(0), reader.GetString(1));
    }

    public async Task<IReadOnlyList<CountrySummaryRecord>> GetCountriesAsync()
    {
        var countries = new List<CountrySummaryRecord>();

        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT country_name, COUNT(*) AS destination_count
            FROM dbo.destinations
            GROUP BY country_name
            ORDER BY country_name ASC
            """;

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            countries.Add(new CountrySummaryRecord(
                reader.GetString(0),
                reader.GetInt32(1)));
        }

        return countries;
    }

    public async Task<PagedDestinationsResult> GetDestinationsAsync(string country, int page, int perPage)
    {
        var normalizedCountry = country.Trim();
        var whereClause = string.IsNullOrWhiteSpace(normalizedCountry)
            ? string.Empty
            : "WHERE country_name = @country";

        await using var connection = await OpenConnectionAsync();

        await using var countCommand = connection.CreateCommand();
        countCommand.CommandText = $"SELECT COUNT(*) FROM dbo.destinations {whereClause}";
        if (!string.IsNullOrWhiteSpace(normalizedCountry))
        {
            countCommand.Parameters.Add(new SqlParameter("@country", normalizedCountry));
        }

        var total = Convert.ToInt32(await countCommand.ExecuteScalarAsync() ?? 0);
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)perPage));
        var safePage = Math.Clamp(page, 1, totalPages);
        var offset = (safePage - 1) * perPage;

        await using var listCommand = connection.CreateCommand();
        listCommand.CommandText = $"""
            SELECT id, location_name, country_name, description, tourist_targets, estimated_cost_per_day
            FROM dbo.destinations
            {whereClause}
            ORDER BY country_name ASC, location_name ASC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            """;
        if (!string.IsNullOrWhiteSpace(normalizedCountry))
        {
            listCommand.Parameters.Add(new SqlParameter("@country", normalizedCountry));
        }

        listCommand.Parameters.Add(new SqlParameter("@offset", offset));
        listCommand.Parameters.Add(new SqlParameter("@limit", perPage));

        var destinations = new List<DestinationRecord>();
        await using var reader = await listCommand.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            destinations.Add(new DestinationRecord(
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetDecimal(5)));
        }

        return new PagedDestinationsResult(destinations, total, safePage, perPage, totalPages);
    }

    public async Task<DestinationRecord?> FindDestinationAsync(int id)
    {
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT TOP (1) id, location_name, country_name, description, tourist_targets, estimated_cost_per_day
            FROM dbo.destinations
            WHERE id = @id
            """;
        command.Parameters.Add(new SqlParameter("@id", id));

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return null;
        }

        return new DestinationRecord(
            reader.GetInt32(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetString(3),
            reader.GetString(4),
            reader.GetDecimal(5));
    }

    public async Task<int> CreateDestinationAsync(ValidatedDestination destination)
    {
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO dbo.destinations (location_name, country_name, description, tourist_targets, estimated_cost_per_day)
            OUTPUT INSERTED.id
            VALUES (@location_name, @country_name, @description, @tourist_targets, @estimated_cost_per_day)
            """;
        AddDestinationParameters(command, destination);
        var insertedId = await command.ExecuteScalarAsync();
        return Convert.ToInt32(insertedId);
    }

    public async Task<bool> UpdateDestinationAsync(int id, ValidatedDestination destination)
    {
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE dbo.destinations
            SET location_name = @location_name,
                country_name = @country_name,
                description = @description,
                tourist_targets = @tourist_targets,
                estimated_cost_per_day = @estimated_cost_per_day,
                updated_at = SYSUTCDATETIME()
            WHERE id = @id
            """;
        AddDestinationParameters(command, destination);
        command.Parameters.Add(new SqlParameter("@id", id));
        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteDestinationAsync(int id)
    {
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM dbo.destinations WHERE id = @id";
        command.Parameters.Add(new SqlParameter("@id", id));
        return await command.ExecuteNonQueryAsync() > 0;
    }

    private async Task<SqlConnection> OpenConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }

    private static void AddDestinationParameters(SqlCommand command, ValidatedDestination destination)
    {
        command.Parameters.Add(new SqlParameter("@location_name", destination.LocationName));
        command.Parameters.Add(new SqlParameter("@country_name", destination.CountryName));
        command.Parameters.Add(new SqlParameter("@description", destination.Description));
        command.Parameters.Add(new SqlParameter("@tourist_targets", destination.TouristTargets));
        command.Parameters.Add(new SqlParameter("@estimated_cost_per_day", destination.EstimatedCostPerDay));
    }
}
