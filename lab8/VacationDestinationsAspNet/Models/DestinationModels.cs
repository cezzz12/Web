using System.Globalization;
using System.Text.Json.Serialization;

namespace VacationDestinationsAspNet.Models;

public sealed class DestinationInput
{
    [JsonPropertyName("location_name")]
    public string? LocationName { get; init; }

    [JsonPropertyName("country_name")]
    public string? CountryName { get; init; }

    [JsonPropertyName("description")]
    public string? Description { get; init; }

    [JsonPropertyName("tourist_targets")]
    public string? TouristTargets { get; init; }

    [JsonPropertyName("estimated_cost_per_day")]
    public string? EstimatedCostPerDay { get; init; }
}

public sealed record ValidatedDestination(
    string LocationName,
    string CountryName,
    string Description,
    string TouristTargets,
    decimal EstimatedCostPerDay);

public sealed record DestinationRecord(
    int Id,
    string LocationName,
    string CountryName,
    string Description,
    string TouristTargets,
    decimal EstimatedCostPerDay)
{
    public object ToApiModel() => new
    {
        id = Id,
        location_name = LocationName,
        country_name = CountryName,
        description = Description,
        tourist_targets = TouristTargets,
        estimated_cost_per_day = EstimatedCostPerDay.ToString("0.00", CultureInfo.InvariantCulture),
    };
}

public sealed record CountrySummaryRecord(string CountryName, int DestinationCount)
{
    public object ToApiModel() => new
    {
        country_name = CountryName,
        destination_count = DestinationCount,
    };
}

public sealed record PagedDestinationsResult(
    IReadOnlyList<DestinationRecord> Destinations,
    int Total,
    int Page,
    int PerPage,
    int TotalPages);

public sealed record AuthenticatedUser(int Id, string Username);
