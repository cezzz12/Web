package ro.ubb.lab7.repository;

import ro.ubb.lab7.config.Database;
import ro.ubb.lab7.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class UserRepository {

    public Optional<User> findByUsername(String username) {
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                     "SELECT id, username, password_hash FROM users WHERE username = ?")) {
            statement.setString(1, username);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(new User(
                            resultSet.getLong("id"),
                            resultSet.getString("username"),
                            resultSet.getString("password_hash")));
                }
            }

            return Optional.empty();
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not fetch user.", exception);
        }
    }
}
