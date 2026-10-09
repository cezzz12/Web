package ro.ubb.lab7.util;

import java.util.regex.Pattern;

public final class ValidationUtils {
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[A-Za-z0-9._-]{3,30}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d).{6,60}$");

    private ValidationUtils() {
    }

    public static boolean isUsernameValid(String username) {
        return username != null && USERNAME_PATTERN.matcher(username).matches();
    }

    public static boolean isPasswordValid(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }

    public static long parsePositiveLong(String rawValue, String fieldName) {
        try {
            long parsedValue = Long.parseLong(rawValue);
            if (parsedValue <= 0) {
                throw new IllegalArgumentException(fieldName + " must be a positive number.");
            }
            return parsedValue;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Please choose a valid " + fieldName + ".");
        }
    }

    public static int parsePositiveInt(String rawValue, String fieldName) {
        try {
            int parsedValue = Integer.parseInt(rawValue);
            if (parsedValue <= 0) {
                throw new IllegalArgumentException(fieldName + " must be a positive number.");
            }
            return parsedValue;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Please choose a valid " + fieldName + ".");
        }
    }
}
