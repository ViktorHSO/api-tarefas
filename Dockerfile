# Etapa 1: compila e empacota o .jar
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src src
RUN ./mvnw -B -q package -DskipTests

# Etapa 2: imagem final só com o Java de execução e o .jar
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd --system --no-create-home api
COPY --from=build /app/target/api-tarefas-*.jar app.jar
USER api

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
