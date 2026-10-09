package ro.ubb.lab7.web;

import jakarta.servlet.annotation.WebListener;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import ro.ubb.lab7.config.DatabaseInitializer;
import ro.ubb.lab7.repository.CityRepository;
import ro.ubb.lab7.repository.RouteRepository;
import ro.ubb.lab7.repository.UserRepository;
import ro.ubb.lab7.service.AuthService;
import ro.ubb.lab7.service.RouteService;

@WebListener
public class ApplicationBootstrapListener implements ServletContextListener {
    public static final String AUTH_SERVICE_ATTRIBUTE = "authService";
    public static final String ROUTE_SERVICE_ATTRIBUTE = "routeService";

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        DatabaseInitializer.initialize();

        ServletContext servletContext = sce.getServletContext();
        servletContext.setAttribute(AUTH_SERVICE_ATTRIBUTE, new AuthService(new UserRepository()));
        servletContext.setAttribute(ROUTE_SERVICE_ATTRIBUTE, new RouteService(new CityRepository(), new RouteRepository()));
    }
}
