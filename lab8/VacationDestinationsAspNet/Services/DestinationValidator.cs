using System.Globalization;
using VacationDestinationsAspNet.Models;

namespace VacationDestinationsAspNet.Services;

public static class DestinationValidator
{
    public static (ValidatedDestination? Destination, Dictionary<string, string> Errors) Validate(DestinationInput? input)
    {
        var locationName = (input?.LocationName ?? string.Empty).Trim();
        var countryName = (input?.CountryName ?? string.Empty).Trim();
        var description = (input?.Description ?? string.Empty).Trim();
        var touristTargets = (input?.TouristTargets ?? string.Empty).Trim();
        var costText = (input?.EstimatedCostPerDay ?? string.Empty).Trim();

        var errors = new Dictionary<string, string>();
        decimal costValue = 0;

        if (locationName.Length < 2)
        {
            errors["location_name"] = "Location name must contain at least 2 characters.";
        }
        else if (locationName.Length > 120)
        {
            errors["location_name"] = "Location name cannot exceed 120 characters.";
        }

        if (countryName.Length < 2)
        {
            errors["country_name"] = "Country name must contain at least 2 characters.";
        }
        else if (countryName.Length > 100)
        {
            errors["country_name"] = "Country name cannot exceed 100 characters.";
        }

        if (description.Length < 10)
        {
            errors["description"] = "Description must contain at least 10 characters.";
        }

        if (touristTargets.Length < 3)
        {
            errors["tourist_targets"] = "Add at least one tourist target.";
        }

        if (costText.Length == 0 ||
            !decimal.TryParse(costText, NumberStyles.Number, CultureInfo.InvariantCulture, out costValue))
        {
            errors["estimated_cost_per_day"] = "Estimated cost must be a valid number.";
        }
        else if (costValue <= 0)
        {
            errors["estimated_cost_per_day"] = "Estimated cost must be greater than 0.";
        }
        else if (costValue > 100000)
        {
            errors["estimated_cost_per_day"] = "Estimated cost is unrealistically high.";
        }

        if (errors.Count > 0)
        {
            return (null, errors);
        }

        var normalizedDestination = new ValidatedDestination(
            locationName,
            countryName,
            description,
            touristTargets,
            decimal.Round(costValue, 2, MidpointRounding.AwayFromZero));

        return (normalizedDestination, errors);
    }
}
