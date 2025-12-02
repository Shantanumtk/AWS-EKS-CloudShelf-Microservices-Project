FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/cart-service-*.jar cart-service.jar
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "cart-service.jar"]
