package ro.ubb.lab7.repository;

import ro.ubb.lab7.config.Database;
import ro.ubb.lab7.model.City;
import ro.ubb.lab7.model.RouteStep;
import ro.ubb.lab7.model.StoredRoute;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class RouteRepository {

    public Optional<Long> findActiveRouteIdByUserId(long userId) {
        String sql = """
                SELECT id
                FROM routes
                WHERE user_id = ? AND status = 'ACTIVE'
                ORDER BY updated_at DESC, id DESC
                LIMIT 1
                """;
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(resultSet.getLong("id"));
                }
                return Optional.empty();
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not fetch the active route.", exception);
        }
    }

    public long createRoute(long userId, long startCityId) {
        try (Connection connection = Database.getConnection()) {
            connection.setAutoCommit(false);
            long routeId = insertRoute(connection, userId);
            insertStep(connection, routeId, 1, startCityId);
            touchRoute(connection, routeId);
            connection.commit();
            return routeId;
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not start the route.", exception);
        }
    }

    public List<RouteStep> findStepsByRouteId(long routeId) {
        String sql = """
                SELECT rs.step_order, c.id, c.name
                FROM route_steps rs
                JOIN cities c ON c.id = rs.city_id
                WHERE rs.route_id = ?
                ORDER BY rs.step_order
                """;
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, routeId);
            try (ResultSet resultSet = statement.executeQuery()) {
                List<RouteStep> steps = new ArrayList<>();
                while (resultSet.next()) {
                    steps.add(new RouteStep(
                            resultSet.getInt("step_order"),
                            new City(resultSet.getLong("id"), resultSet.getString("name"))));
                }
                return steps;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not fetch route steps.", exception);
        }
    }

    public void appendStep(long routeId, long cityId) {
        try (Connection connection = Database.getConnection()) {
            connection.setAutoCommit(false);
            int nextOrder = findNextStepOrder(connection, routeId);
            insertStep(connection, routeId, nextOrder, cityId);
            touchRoute(connection, routeId);
            connection.commit();
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not add the new station to the route.", exception);
        }
    }

    public void deleteStepsAfter(long routeId, int stepOrder) {
        String sql = "DELETE FROM route_steps WHERE route_id = ? AND step_order > ?";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, routeId);
            statement.setInt(2, stepOrder);
            statement.executeUpdate();
            touchRoute(connection, routeId);
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not go back to the selected station.", exception);
        }
    }

    public void markCompleted(long routeId) {
        String sql = "UPDATE routes SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, routeId);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not finalize the route.", exception);
        }
    }

    public boolean deleteRoute(long userId, long routeId, String status) {
        String sql = "DELETE FROM routes WHERE id = ? AND user_id = ? AND status = ?";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, routeId);
            statement.setLong(2, userId);
            statement.setString(3, status);
            return statement.executeUpdate() > 0;
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not remove the route.", exception);
        }
    }

    public List<StoredRoute> findCompletedRoutesByUserId(long userId) {
        String sql = """
                SELECT r.id AS route_id, rs.step_order, c.id AS city_id, c.name AS city_name
                FROM routes r
                JOIN route_steps rs ON rs.route_id = r.id
                JOIN cities c ON c.id = rs.city_id
                WHERE r.user_id = ? AND r.status = 'COMPLETED'
                ORDER BY r.updated_at DESC, r.id DESC, rs.step_order
                """;
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            try (ResultSet resultSet = statement.executeQuery()) {
                Map<Long, List<City>> groupedRoutes = new LinkedHashMap<>();
                while (resultSet.next()) {
                    groupedRoutes.computeIfAbsent(resultSet.getLong("route_id"), ignored -> new ArrayList<>())
                            .add(new City(resultSet.getLong("city_id"), resultSet.getString("city_name")));
                }

                List<StoredRoute> routes = new ArrayList<>();
                for (Map.Entry<Long, List<City>> entry : groupedRoutes.entrySet()) {
                    routes.add(new StoredRoute(entry.getKey(), entry.getValue()));
                }
                return routes;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not fetch completed routes.", exception);
        }
    }

    public Optional<StoredRoute> findCompletedRouteByUserId(long userId, long routeId) {
        String sql = """
                SELECT r.id AS route_id, rs.step_order, c.id AS city_id, c.name AS city_name
                FROM routes r
                JOIN route_steps rs ON rs.route_id = r.id
                JOIN cities c ON c.id = rs.city_id
                WHERE r.user_id = ? AND r.status = 'COMPLETED' AND r.id = ?
                ORDER BY rs.step_order
                """;
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            statement.setLong(2, routeId);

            try (ResultSet resultSet = statement.executeQuery()) {
                List<City> cities = new ArrayList<>();
                while (resultSet.next()) {
                    cities.add(new City(resultSet.getLong("city_id"), resultSet.getString("city_name")));
                }

                if (cities.isEmpty()) {
                    return Optional.empty();
                }
                return Optional.of(new StoredRoute(routeId, cities));
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not fetch the completed route.", exception);
        }
    }

    private long insertRoute(Connection connection, long userId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO routes (user_id, status) VALUES (?, 'ACTIVE')",
                Statement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, userId);
            statement.executeUpdate();
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return generatedKeys.getLong(1);
                }
            }
        }

        throw new SQLException("Could not create route.");
    }

    private int findNextStepOrder(Connection connection, long routeId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT COALESCE(MAX(step_order), 0) + 1 AS next_step FROM route_steps WHERE route_id = ?")) {
            statement.setLong(1, routeId);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getInt("next_step");
            }
        }
    }

    private void insertStep(Connection connection, long routeId, int order, long cityId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO route_steps (route_id, step_order, city_id) VALUES (?, ?, ?)")) {
            statement.setLong(1, routeId);
            statement.setInt(2, order);
            statement.setLong(3, cityId);
            statement.executeUpdate();
        }
    }

    private void touchRoute(Connection connection, long routeId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE routes SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")) {
            statement.setLong(1, routeId);
            statement.executeUpdate();
        }
    }
}
