package ro.ubb.lab7.model;

public class City {
    private final long id;
    private final String name;

    public City(long id, String name) {
        this.id = id;
        this.name = name;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
