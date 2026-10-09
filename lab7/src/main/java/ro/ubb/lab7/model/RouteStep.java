package ro.ubb.lab7.model;

public class RouteStep {
    private final int order;
    private final City city;

    public RouteStep(int order, City city) {
        this.order = order;
        this.city = city;
    }

    public int getOrder() {
        return order;
    }

    public City getCity() {
        return city;
    }
}
