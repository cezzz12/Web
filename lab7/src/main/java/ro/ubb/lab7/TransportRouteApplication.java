package ro.ubb.lab7;

import org.apache.catalina.Context;
import org.apache.catalina.WebResourceRoot;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.webresources.DirResourceSet;
import org.apache.catalina.webresources.StandardRoot;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

public final class TransportRouteApplication {

    private TransportRouteApplication() {
    }

    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getProperty("app.port", "8080"));

        Tomcat tomcat = new Tomcat();
        tomcat.setPort(port);
        tomcat.setBaseDir(Files.createTempDirectory("transport-route-tomcat").toString());
        tomcat.getConnector();

        File webAppDirectory = Path.of("src", "main", "webapp").toFile().getAbsoluteFile();
        Context context = tomcat.addWebapp("", webAppDirectory.getAbsolutePath());
        context.setParentClassLoader(TransportRouteApplication.class.getClassLoader());

        File classesDirectory = Path.of("target", "classes").toFile().getAbsoluteFile();
        WebResourceRoot resources = new StandardRoot(context);
        resources.addPreResources(new DirResourceSet(resources, "/WEB-INF/classes", classesDirectory.getAbsolutePath(), "/"));
        context.setResources(resources);

        tomcat.start();
        tomcat.getServer().await();
    }
}
