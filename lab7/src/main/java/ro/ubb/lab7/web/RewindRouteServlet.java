package ro.ubb.lab7.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ro.ubb.lab7.util.FlashMessage;
import ro.ubb.lab7.util.ValidationUtils;

import java.io.IOException;

@WebServlet("/route/rewind")
public class RewindRouteServlet extends BaseServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            int stepOrder = ValidationUtils.parsePositiveInt(request.getParameter("stepOrder"), "station");
            routeService.rewindRoute(getCurrentUserId(request), stepOrder);
            FlashMessage.success(request, "Returned to the selected station. Choose a different neighboring city if you changed your mind.");
        } catch (IllegalArgumentException | IllegalStateException exception) {
            FlashMessage.error(request, exception.getMessage());
        }

        redirect(request, response, "/app");
    }
}
