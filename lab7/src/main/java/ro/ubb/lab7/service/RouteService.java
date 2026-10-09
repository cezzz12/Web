package ro.ubb.lab7.service;

import ro.ubb.lab7.model.ActiveRoute;
import ro.ubb.lab7.model.City;
import ro.ubb.lab7.model.RouteStep;
import ro.ubb.lab7.model.StoredRoute;
import ro.ubb.lab7.repository.CityRepository;
import ro.ubb.lab7.repository.RouteRepository;

import java.util.List;
import java.util.Optional;

public class RouteService {
    private final CityRepository cityRepository;
    private final RouteRepository routeRepository;

    public RouteService(CityRepository cityRepository, RouteRepository routeRepository) {
        this.cityRepository = cityRepository;
        this.routeRepository = routeRepository;
    }

    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    public ActiveRoute getActiveRoute(long userId) {
        Optional<Long> routeId = routeRepository.findActiveRouteIdByUserId(userId);
        if (routeId.isEmpty()) {
            return null;
        }

        List<RouteStep> steps = routeRepository.findStepsByRouteId(routeId.get());
        if (steps.isEmpty()) {
            return null;
        }

        City currentCity = steps.get(steps.size() - 1).getCity();
        return new ActiveRoute(routeId.get(), steps, cityRepository.findNeighbors(currentCity.getId()));
    }

    public List<StoredRoute> getCompletedRoutes(long userId) {
        return routeRepository.findCompletedRoutesByUserId(userId);
    }

    public StoredRoute getCompletedRoute(long userId, Long routeId) {
        if (routeId == null) {
            return null;
        }
        return routeRepository.findCompletedRouteByUserId(userId, routeId).orElse(null);
    }

    public void startRoute(long userId, long startCityId) {
        ensureNoActiveRoute(userId);
        ensureCityExists(startCityId);
        routeRepository.createRoute(userId, startCityId);
    }

    public void advanceRoute(long userId, long cityId) {
        ActiveRoute activeRoute = requireActiveRoute(userId);

        boolean isNeighbor = activeRoute.getNeighbors().stream()
                .anyMatch(city -> city.getId() == cityId);
        if (!isNeighbor) {
            throw new IllegalArgumentException("You can only move to a neighboring city.");
        }

        routeRepository.appendStep(activeRoute.getRouteId(), cityId);
    }

    public void rewindRoute(long userId, int stepOrder) {
        ActiveRoute activeRoute = requireActiveRoute(userId);
        boolean stationExists = activeRoute.getSteps().stream()
                .anyMatch(step -> step.getOrder() == stepOrder);

        if (!stationExists) {
            throw new IllegalArgumentException("The selected station is not part of the current route.");
        }

        if (stepOrder < activeRoute.getCurrentStepOrder()) {
            routeRepository.deleteStepsAfter(activeRoute.getRouteId(), stepOrder);
        }
    }

    public long finalizeRoute(long userId) {
        ActiveRoute activeRoute = requireActiveRoute(userId);
        routeRepository.markCompleted(activeRoute.getRouteId());
        return activeRoute.getRouteId();
    }

    public void cancelRoute(long userId) {
        ActiveRoute activeRoute = requireActiveRoute(userId);
        routeRepository.deleteRoute(userId, activeRoute.getRouteId(), "ACTIVE");
    }

    public void deleteCompletedRoute(long userId, long routeId) {
        boolean deleted = routeRepository.deleteRoute(userId, routeId, "COMPLETED");
        if (!deleted) {
            throw new IllegalArgumentException("The selected completed route no longer exists.");
        }
    }

    private void ensureNoActiveRoute(long userId) {
        if (routeRepository.findActiveRouteIdByUserId(userId).isPresent()) {
            throw new IllegalStateException("Finish or cancel the current route before starting a new one.");
        }
    }

    private void ensureCityExists(long cityId) {
        cityRepository.findById(cityId)
                .orElseThrow(() -> new IllegalArgumentException("Please choose a valid starting city."));
    }

    private ActiveRoute requireActiveRoute(long userId) {
        ActiveRoute activeRoute = getActiveRoute(userId);
        if (activeRoute == null) {
            throw new IllegalStateException("There is no active route. Start one from the list of cities.");
        }
        return activeRoute;
    }
}
