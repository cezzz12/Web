package ro.ubb.lab7.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class Database {
    private static final String JDBC_URL;
    private static final String JDBC_USER = "sa";
    private static final String JDBC_PASSWORD = "";

    static {
        try {
            Path dataDirectory = Path.of(System.getProperty("user.dir"), "data");
            Files.createDirectories(dataDirectory);
            String databasePath = dataDirectory.resolve("transport-route-db").toAbsolutePath().toString().replace("\\", "/");
            JDBC_URL = "jdbc:h2:file:" + databasePath + ";DB_CLOSE_ON_EXIT=FALSE";
            Class.forName("org.h2.Driver");
        } catch (Exception exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }

    private Database() {
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    }
}
