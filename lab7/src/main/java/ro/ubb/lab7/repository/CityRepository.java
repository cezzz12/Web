package ro.ubb.lab7.repository;

import ro.ubb.lab7.config.Database;
import ro.ubb.lab7.model.City;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class CityRepository {

    public List<City> findAll() {
        String sql = "SELECT id, name FROM cities ORDER BY name";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            List<City> cities = new ArrayList<>();
            while (resultSet.next()) {
                cities.add(mapCity(resultSet));
            }
            return cities;
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not fetch cities.", exception);
        }
    }

    public Optional<City> findById(long cityId) {
        String sql = "SELECT id, name FROM cities WHERE id = ?";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, cityId);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(mapCity(resultSet));
                }
                return Optional.empty();
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not fetch the selected city.", exception);
        }
    }

    public List<City> findNeighbors(long cityId) {
        String sql = """
                SELECT c.id, c.name
                FROM city_neighbors cn
                JOIN cities c ON c.id = cn.neighbor_id
                WHERE cn.city_id = ?
                ORDER BY c.name
                """;
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, cityId);
            try (ResultSet resultSet = statement.executeQuery()) {
                List<City> neighbors = new ArrayList<>();
                while (resultSet.next()) {
                    neighbors.add(mapCity(resultSet));
                }
                return neighbors;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not fetch neighboring cities.", exception);
        }
    }

    private City mapCity(ResultSet resultSet) throws SQLException {
        return new City(
                resultSet.getLong("id"),
                resultSet.getString("name"));
    }
}
