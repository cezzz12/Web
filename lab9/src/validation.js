function validateDestination(input) {
  const data = {
    location_name: String(input?.location_name ?? '').trim(),
    country_name: String(input?.country_name ?? '').trim(),
    description: String(input?.description ?? '').trim(),
    tourist_targets: String(input?.tourist_targets ?? '').trim(),
    estimated_cost_per_day: String(input?.estimated_cost_per_day ?? '').trim(),
  };

  const errors = {};
  let normalizedCost = 0;

  if (data.location_name.length < 2) {
    errors.location_name = 'Location name must contain at least 2 characters.';
  } else if (data.location_name.length > 120) {
    errors.location_name = 'Location name cannot exceed 120 characters.';
  }

  if (data.country_name.length < 2) {
    errors.country_name = 'Country name must contain at least 2 characters.';
  } else if (data.country_name.length > 100) {
    errors.country_name = 'Country name cannot exceed 100 characters.';
  }

  if (data.description.length < 10) {
    errors.description = 'Description must contain at least 10 characters.';
  }

  if (data.tourist_targets.length < 3) {
    errors.tourist_targets = 'Add at least one tourist target.';
  }

  if (data.estimated_cost_per_day.length === 0 || Number.isNaN(Number(data.estimated_cost_per_day))) {
    errors.estimated_cost_per_day = 'Estimated cost must be a valid number.';
  } else {
    normalizedCost = Number(data.estimated_cost_per_day);
    if (!Number.isFinite(normalizedCost) || normalizedCost <= 0) {
      errors.estimated_cost_per_day = 'Estimated cost must be greater than 0.';
    } else if (normalizedCost > 100000) {
      errors.estimated_cost_per_day = 'Estimated cost is unrealistically high.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      ...data,
      estimated_cost_per_day: normalizedCost.toFixed(2),
    },
    errors,
  };
}

function validateCredentials(username, password) {
  const errors = {};
  const normalizedUsername = String(username ?? '').trim();
  const normalizedPassword = String(password ?? '');

  if (normalizedUsername.length < 3) {
    errors.username = 'Username must contain at least 3 characters.';
  } else if (normalizedUsername.length > 60) {
    errors.username = 'Username cannot exceed 60 characters.';
  }

  if (normalizedPassword.length < 6) {
    errors.password = 'Password must contain at least 6 characters.';
  } else if (normalizedPassword.length > 100) {
    errors.password = 'Password cannot exceed 100 characters.';
  }

  return {
    username: normalizedUsername,
    password: normalizedPassword,
    errors,
  };
}

module.exports = {
  validateCredentials,
  validateDestination,
};
