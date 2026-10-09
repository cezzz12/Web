package ro.ubb.lab7.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

public class FlashMessage {
    private static final String FLASH_ATTRIBUTE = "flashMessage";

    private final String type;
    private final String text;

    public FlashMessage(String type, String text) {
        this.type = type;
        this.text = text;
    }

    public String getType() {
        return type;
    }

    public String getText() {
        return text;
    }

    public static void success(HttpServletRequest request, String text) {
        store(request, new FlashMessage("success", text));
    }

    public static void error(HttpServletRequest request, String text) {
        store(request, new FlashMessage("error", text));
    }

    public static FlashMessage consume(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }

        FlashMessage message = (FlashMessage) session.getAttribute(FLASH_ATTRIBUTE);
        if (message != null) {
            session.removeAttribute(FLASH_ATTRIBUTE);
        }
        return message;
    }

    private static void store(HttpServletRequest request, FlashMessage flashMessage) {
        request.getSession(true).setAttribute(FLASH_ATTRIBUTE, flashMessage);
    }
}
