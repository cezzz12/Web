package ro.ubb.lab7.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import ro.ubb.lab7.model.User;
import ro.ubb.lab7.util.FlashMessage;
import ro.ubb.lab7.util.ValidationUtils;

import java.io.IOException;
import java.util.Optional;

@WebServlet("/login")
public class LoginServlet extends BaseServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (getCurrentUserId(request) != null) {
            redirect(request, response, "/app");
            return;
        }

        request.setAttribute("flashMessage", FlashMessage.consume(request));
        forward(request, response, "/WEB-INF/views/login.jsp");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String username = normalize(request.getParameter("username"));
        String password = normalize(request.getParameter("password"));

        request.setAttribute("submittedUsername", username);

        boolean hasErrors = false;
        if (!ValidationUtils.isUsernameValid(username)) {
            request.setAttribute("usernameError", "Username must be 3-30 characters and contain only letters, numbers, dots, underscores, or dashes.");
            hasErrors = true;
        }
        if (!ValidationUtils.isPasswordValid(password)) {
            request.setAttribute("passwordError", "Password must be 6-60 characters long and include at least one letter and one digit.");
            hasErrors = true;
        }
        if (hasErrors) {
            forward(request, response, "/WEB-INF/views/login.jsp");
            return;
        }

        Optional<User> authenticatedUser = authService.authenticate(username, password);
        if (authenticatedUser.isEmpty()) {
            request.setAttribute("loginError", "Invalid username or password.");
            forward(request, response, "/WEB-INF/views/login.jsp");
            return;
        }

        HttpSession existingSession = request.getSession(false);
        if (existingSession != null) {
            existingSession.invalidate();
        }

        HttpSession newSession = request.getSession(true);
        newSession.setAttribute("userId", authenticatedUser.get().getId());
        newSession.setAttribute("username", authenticatedUser.get().getUsername());

        FlashMessage.success(request, "Login successful. Continue choosing your route.");
        redirect(request, response, "/app");
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
