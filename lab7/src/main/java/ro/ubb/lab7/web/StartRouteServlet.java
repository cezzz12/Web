package ro.ubb.lab7.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ro.ubb.lab7.util.FlashMessage;
import ro.ubb.lab7.util.ValidationUtils;

import java.io.IOException;

@WebServlet("/route/start")
public class StartRouteServlet extends BaseServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            long cityId = ValidationUtils.parsePositiveLong(request.getParameter("startCityId"), "starting city");
            routeService.startRoute(getCurrentUserId(request), cityId);
            FlashMessage.success(request, "Route started. Pick a neighboring city to continue.");
        } catch (IllegalArgumentException | IllegalStateException exception) {
            FlashMessage.error(request, exception.getMessage());
        }

        redirect(request, response, "/app");
    }
}
