package ro.ubb.lab7.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ro.ubb.lab7.util.FlashMessage;

import java.io.IOException;

@WebServlet("/route/finalize")
public class FinalizeRouteServlet extends BaseServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            long routeId = routeService.finalizeRoute(getCurrentUserId(request));
            FlashMessage.success(request, "Route finalized. The complete path is shown below.");
            redirect(request, response, "/app?completedRouteId=" + routeId);
            return;
        } catch (IllegalArgumentException | IllegalStateException exception) {
            FlashMessage.error(request, exception.getMessage());
        }

        redirect(request, response, "/app");
    }
}
