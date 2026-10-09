package ro.ubb.lab7.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ro.ubb.lab7.util.FlashMessage;
import ro.ubb.lab7.util.ValidationUtils;

import java.io.IOException;

@WebServlet("/route/delete")
public class DeleteCompletedRouteServlet extends BaseServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            long routeId = ValidationUtils.parsePositiveLong(request.getParameter("routeId"), "completed route");
            routeService.deleteCompletedRoute(getCurrentUserId(request), routeId);
            FlashMessage.success(request, "The completed route was deleted.");
        } catch (IllegalArgumentException | IllegalStateException exception) {
            FlashMessage.error(request, exception.getMessage());
        }

        redirect(request, response, "/app");
    }
}
