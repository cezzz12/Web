package ro.ubb.lab7.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ro.ubb.lab7.util.FlashMessage;

import java.io.IOException;

@WebServlet("/route/cancel")
public class CancelRouteServlet extends BaseServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            routeService.cancelRoute(getCurrentUserId(request));
            FlashMessage.success(request, "The active route was canceled.");
        } catch (IllegalArgumentException | IllegalStateException exception) {
            FlashMessage.error(request, exception.getMessage());
        }

        redirect(request, response, "/app");
    }
}
