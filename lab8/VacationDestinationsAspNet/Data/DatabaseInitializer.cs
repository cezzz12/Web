using Microsoft.Data.SqlClient;
using VacationDestinationsAspNet.Services;

namespace VacationDestinationsAspNet.Data;

public static class DatabaseInitializer
{
    public static async Task EnsureDatabaseAsync(string connectionString, string seedUsername, string seedPassword)
    {
        var connectionBuilder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = connectionBuilder.InitialCatalog;

        if (string.IsNullOrWhiteSpace(databaseName))
        {
            throw new InvalidOperationException("The SQL Server connection string must include a database name.");
        }

        if (!databaseName.All(character => char.IsLetterOrDigit(character) || character == '_'))
        {
            throw new InvalidOperationException("The database name may only contain letters, numbers, and underscores.");
        }

        var masterConnectionBuilder = new SqlConnectionStringBuilder(connectionString)
        {
            InitialCatalog = "master",
        };

        await using (var masterConnection = new SqlConnection(masterConnectionBuilder.ConnectionString))
        {
            await masterConnection.OpenAsync();

            await using var createDatabaseCommand = masterConnection.CreateCommand();
            createDatabaseCommand.CommandText = $"IF DB_ID(N'{databaseName}') IS NULL CREATE DATABASE [{databaseName}]";
            await createDatabaseCommand.ExecuteNonQueryAsync();
        }

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var schemaCommand = connection.CreateCommand();
        schemaCommand.CommandText = """
            IF OBJECT_ID(N'dbo.app_users', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.app_users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    username NVARCHAR(60) NOT NULL UNIQUE,
                    password_hash NVARCHAR(400) NOT NULL,
                    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
                );
            END;

            IF OBJECT_ID(N'dbo.destinations', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.destinations (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    location_name NVARCHAR(120) NOT NULL,
                    country_name NVARCHAR(100) NOT NULL,
                    description NVARCHAR(MAX) NOT NULL,
                    tourist_targets NVARCHAR(MAX) NOT NULL,
                    estimated_cost_per_day DECIMAL(10, 2) NOT NULL,
                    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
                );
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_destinations_country' AND object_id = OBJECT_ID(N'dbo.destinations'))
            BEGIN
                CREATE INDEX idx_destinations_country ON dbo.destinations(country_name);
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_destinations_location' AND object_id = OBJECT_ID(N'dbo.destinations'))
            BEGIN
                CREATE INDEX idx_destinations_location ON dbo.destinations(location_name);
            END;

            IF NOT EXISTS (SELECT 1 FROM dbo.app_users WHERE username = @username)
            BEGIN
                INSERT INTO dbo.app_users (username, password_hash)
                VALUES (@username, @password_hash);
            END;

            IF NOT EXISTS (SELECT 1 FROM dbo.destinations)
            BEGIN
                INSERT INTO dbo.destinations (location_name, country_name, description, tourist_targets, estimated_cost_per_day)
                VALUES
                    (N'Paris', N'France', N'Classic city break with museums, monuments, cafes, and walkable neighborhoods.', N'Eiffel Tower, Louvre Museum, Montmartre, Notre-Dame area', 165.00),
                    (N'Barcelona', N'Spain', N'Mediterranean destination with beaches, distinctive architecture, and lively food markets.', N'Sagrada Familia, Park Guell, La Rambla, Barceloneta Beach', 135.00),
                    (N'Brasov', N'Romania', N'Mountain city close to castles, hiking trails, medieval squares, and scenic viewpoints.', N'Council Square, Tampa Mountain, Bran Castle, Rasnov Fortress', 75.00),
                    (N'Kyoto', N'Japan', N'Historic destination known for temples, gardens, tea culture, and traditional streets.', N'Fushimi Inari Shrine, Kiyomizu-dera, Arashiyama Bamboo Grove, Gion', 145.00),
                    (N'Rome', N'Italy', N'Ancient city with major archaeological sites, churches, piazzas, and excellent food.', N'Colosseum, Roman Forum, Vatican Museums, Trevi Fountain', 150.00),
                    (N'Cluj-Napoca', N'Romania', N'Student city with cultural events, parks, cafes, and quick access to Transylvanian trips.', N'Central Park, Botanical Garden, Union Square, Turda Salt Mine', 65.00);
            END;
            """;
        schemaCommand.Parameters.Add(new SqlParameter("@username", seedUsername));
        schemaCommand.Parameters.Add(new SqlParameter("@password_hash", PasswordHasher.HashPassword(seedPassword)));
        await schemaCommand.ExecuteNonQueryAsync();
    }
}
