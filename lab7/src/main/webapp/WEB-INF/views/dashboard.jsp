<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard | Transport Route App</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/styles.css">
    <script defer src="${pageContext.request.contextPath}/assets/app.js"></script>
</head>
<body>
<header class="topbar">
    <div>
        <p class="eyebrow">Authenticated Area</p>
        <h1>Transport Route Planner</h1>
    </div>
    <div class="topbar-actions">
        <p class="logged-user">Logged in as <strong>${sessionScope.username}</strong></p>
        <form method="post" action="${pageContext.request.contextPath}/logout">
            <button type="submit" class="ghost-button">Log Out</button>
        </form>
    </div>
</header>

<main class="page-shell">
    <c:if test="${flashMessage != null}">
        <div class="flash ${flashMessage.type}">${flashMessage.text}</div>
    </c:if>

    <section class="panel">
        <div class="panel-heading">
            <p class="eyebrow">Saved State</p>
            <h2>Current route</h2>
            <p>The route state is stored in the database, while the session only keeps you logged in.</p>
        </div>

        <c:choose>
            <c:when test="${activeRoute == null}">
                <form method="post" action="${pageContext.request.contextPath}/route/start" class="inline-form start-form">
                    <div class="form-row compact">
                        <label for="startCityId">Starting city</label>
                        <select id="startCityId" name="startCityId" required>
                            <option value="">Choose a city</option>
                            <c:forEach var="city" items="${cities}">
                                <option value="${city.id}">${city.name}</option>
                            </c:forEach>
                        </select>
                    </div>
                    <button type="submit" class="primary-button">Start Route</button>
                </form>
            </c:when>
            <c:otherwise>
                <div class="route-overview">
                    <div class="route-summary">
                        <h3>Selected path</h3>
                        <p class="route-path">${activeRoute.path}</p>
                    </div>
                    <div class="route-actions">
                        <form method="post" action="${pageContext.request.contextPath}/route/finalize">
                            <button type="submit" class="primary-button">Set Current Station as Final Destination</button>
                        </form>
                        <form method="post"
                              action="${pageContext.request.contextPath}/route/cancel"
                              data-confirm="Cancel the active route? The selected stations will be removed.">
                            <button type="submit" class="danger-button">Cancel Route</button>
                        </form>
                    </div>
                </div>

                <div class="two-column-layout">
                    <section class="subpanel">
                        <h3>Route history</h3>
                        <p>Click a previously selected station to go back and change the rest of the route.</p>
                        <div class="steps-list">
                            <c:forEach var="step" items="${activeRoute.steps}">
                                <div class="step-card ${step.order == activeRoute.currentStepOrder ? 'current-step' : ''}">
                                    <div>
                                        <p class="step-number">Stop ${step.order}</p>
                                        <strong>${step.city.name}</strong>
                                    </div>
                                    <c:choose>
                                        <c:when test="${step.order == activeRoute.currentStepOrder}">
                                            <span class="badge">Current station</span>
                                        </c:when>
                                        <c:otherwise>
                                            <form method="post" action="${pageContext.request.contextPath}/route/rewind">
                                                <input type="hidden" name="stepOrder" value="${step.order}">
                                                <button type="submit" class="ghost-button">Return Here</button>
                                            </form>
                                        </c:otherwise>
                                    </c:choose>
                                </div>
                            </c:forEach>
                        </div>
                    </section>

                    <section class="subpanel">
                        <h3>Available neighboring cities</h3>
                        <p>Current station: <strong>${activeRoute.currentCity.name}</strong></p>

                        <c:choose>
                            <c:when test="${empty activeRoute.neighbors}">
                                <p class="empty-state">No neighboring cities are configured for this station.</p>
                            </c:when>
                            <c:otherwise>
                                <div class="city-grid">
                                    <c:forEach var="neighbor" items="${activeRoute.neighbors}">
                                        <form method="post" action="${pageContext.request.contextPath}/route/advance">
                                            <input type="hidden" name="cityId" value="${neighbor.id}">
                                            <button type="submit" class="city-button">${neighbor.name}</button>
                                        </form>
                                    </c:forEach>
                                </div>
                            </c:otherwise>
                        </c:choose>
                    </section>
                </div>
            </c:otherwise>
        </c:choose>
    </section>

    <section class="panel">
        <div class="panel-heading">
            <p class="eyebrow">Completed Routes</p>
            <h2>Saved final paths</h2>
            <p>You can inspect a previously completed route or delete it without typing any IDs manually.</p>
        </div>

        <c:choose>
            <c:when test="${empty completedRoutes}">
                <p class="empty-state">No completed routes yet. Finalize one to see it here.</p>
            </c:when>
            <c:otherwise>
                <div class="completed-route-list">
                    <c:forEach var="completedRoute" items="${completedRoutes}">
                        <article class="completed-route-card">
                            <div>
                                <p class="step-number">Route #${completedRoute.routeId}</p>
                                <p class="route-path">${completedRoute.path}</p>
                            </div>
                            <div class="card-actions">
                                <a class="ghost-button" href="${pageContext.request.contextPath}/app?completedRouteId=${completedRoute.routeId}">View Route</a>
                                <form method="post"
                                      action="${pageContext.request.contextPath}/route/delete"
                                      data-confirm="Delete this completed route permanently?">
                                    <input type="hidden" name="routeId" value="${completedRoute.routeId}">
                                    <button type="submit" class="danger-button">Delete</button>
                                </form>
                            </div>
                        </article>
                    </c:forEach>
                </div>
            </c:otherwise>
        </c:choose>

        <c:if test="${selectedCompletedRoute != null}">
            <section class="selected-route">
                <h3>Selected completed route</h3>
                <p><strong>From:</strong> ${selectedCompletedRoute.startCityName}</p>
                <p><strong>To:</strong> ${selectedCompletedRoute.endCityName}</p>
                <p class="route-path">${selectedCompletedRoute.path}</p>
            </section>
        </c:if>
    </section>
</main>
</body>
</html>
