package ro.ubb.lab7.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ro.ubb.lab7.util.FlashMessage;
import ro.ubb.lab7.util.ValidationUtils;

import java.io.IOException;

@WebServlet("/app")
public class DashboardServlet extends BaseServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Long userId = getCurrentUserId(request);
        Long selectedCompletedRouteId = parseOptionalRouteId(request.getParameter("completedRouteId"));

        request.setAttribute("activeRoute", routeService.getActiveRoute(userId));
        request.setAttribute("cities", routeService.getAllCities());
        request.setAttribute("completedRoutes", routeService.getCompletedRoutes(userId));
        request.setAttribute("selectedCompletedRoute", routeService.getCompletedRoute(userId, selectedCompletedRouteId));
        request.setAttribute("flashMessage", FlashMessage.consume(request));

        forward(request, response, "/WEB-INF/views/dashboard.jsp");
    }

    private Long parseOptionalRouteId(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }
        try {
            return ValidationUtils.parsePositiveLong(rawValue, "completed route");
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }
}
