package ro.ubb.lab7.model;

import java.util.List;
import java.util.stream.Collectors;

public class StoredRoute {
    private final long routeId;
    private final List<City> cities;

    public StoredRoute(long routeId, List<City> cities) {
        this.routeId = routeId;
        this.cities = List.copyOf(cities);
    }

    public long getRouteId() {
        return routeId;
    }

    public List<City> getCities() {
        return cities;
    }

    public String getPath() {
        return cities.stream()
                .map(City::getName)
                .collect(Collectors.joining(" -> "));
    }

    public String getStartCityName() {
        return cities.isEmpty() ? "" : cities.get(0).getName();
    }

    public String getEndCityName() {
        return cities.isEmpty() ? "" : cities.get(cities.size() - 1).getName();
    }
}
