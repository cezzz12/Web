package ro.ubb.lab7.model;

import java.util.List;
import java.util.stream.Collectors;

public class ActiveRoute {
    private final long routeId;
    private final List<RouteStep> steps;
    private final List<City> neighbors;

    public ActiveRoute(long routeId, List<RouteStep> steps, List<City> neighbors) {
        this.routeId = routeId;
        this.steps = List.copyOf(steps);
        this.neighbors = List.copyOf(neighbors);
    }

    public long getRouteId() {
        return routeId;
    }

    public List<RouteStep> getSteps() {
        return steps;
    }

    public List<City> getNeighbors() {
        return neighbors;
    }

    public City getCurrentCity() {
        return steps.isEmpty() ? null : steps.get(steps.size() - 1).getCity();
    }

    public int getCurrentStepOrder() {
        return steps.isEmpty() ? 0 : steps.get(steps.size() - 1).getOrder();
    }

    public String getPath() {
        return steps.stream()
                .map(step -> step.getCity().getName())
                .collect(Collectors.joining(" -> "));
    }
}
