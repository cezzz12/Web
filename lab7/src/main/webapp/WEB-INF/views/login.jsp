<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | Transport Route App</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/styles.css">
    <script defer src="${pageContext.request.contextPath}/assets/app.js"></script>
</head>
<body class="auth-page">
<main class="page-shell narrow-shell">
    <section class="panel auth-panel">
        <div class="panel-heading">
            <h1>Transport Route Planner</h1>
            <p>Sign in to choose a route and keep the selected stations saved in the database.</p>
        </div>

        <c:if test="${flashMessage != null}">
            <div class="flash ${flashMessage.type}">${flashMessage.text}</div>
        </c:if>

        <c:if test="${loginError != null}">
            <div class="flash error">${loginError}</div>
        </c:if>

        <form method="post" action="${pageContext.request.contextPath}/login" class="stack-form">
            <div class="form-row">
                <label for="username">Username</label>
                <input id="username"
                       name="username"
                       type="text"
                       value="${submittedUsername}"
                       required
                       minlength="3"
                       maxlength="30"
                       pattern="[A-Za-z0-9._-]{3,30}"
                       autocomplete="username">
                <c:if test="${usernameError != null}">
                    <p class="field-error">${usernameError}</p>
                </c:if>
            </div>

            <div class="form-row">
                <label for="password">Password</label>
                <input id="password"
                       name="password"
                       type="password"
                       required
                       minlength="6"
                       maxlength="60"
                       autocomplete="current-password">
                <c:if test="${passwordError != null}">
                    <p class="field-error">${passwordError}</p>
                </c:if>
            </div>

            <button type="submit" class="primary-button">Log In</button>
        </form>

        <div class="demo-credentials">
            <h2>Demo accounts</h2>
            <p><strong>traveler</strong> / <strong>Route123</strong></p>
            <p><strong>planner</strong> / <strong>Journey456</strong></p>
        </div>
    </section>
</main>
</body>
</html>
