package ro.ubb.lab7.web;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import ro.ubb.lab7.service.AuthService;
import ro.ubb.lab7.service.RouteService;

import java.io.IOException;

public abstract class BaseServlet extends HttpServlet {
    protected AuthService authService;
    protected RouteService routeService;

    @Override
    public void init() throws ServletException {
        ServletContext servletContext = getServletContext();
        authService = (AuthService) servletContext.getAttribute(ApplicationBootstrapListener.AUTH_SERVICE_ATTRIBUTE);
        routeService = (RouteService) servletContext.getAttribute(ApplicationBootstrapListener.ROUTE_SERVICE_ATTRIBUTE);
    }

    protected Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }

        Object userId = session.getAttribute("userId");
        return userId instanceof Long ? (Long) userId : null;
    }

    protected void redirect(HttpServletRequest request, HttpServletResponse response, String path) throws IOException {
        response.sendRedirect(request.getContextPath() + path);
    }

    protected void forward(HttpServletRequest request, HttpServletResponse response, String viewPath)
            throws ServletException, IOException {
        RequestDispatcher dispatcher = request.getRequestDispatcher(viewPath);
        dispatcher.forward(request, response);
    }
}
