# Stage 1: Build the application using Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src
# Package the application (skipping tests to speed up deployment)
RUN mvn clean package -DskipTests

# Stage 2: Run the application using a lightweight Java runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy the built .jar file from the build stage
COPY --from=build /app/target/*.jar app.jar
# Expose the standard Spring Boot port
EXPOSE 8080
# Start the server
ENTRYPOINT ["java", "-jar", "app.jar"]