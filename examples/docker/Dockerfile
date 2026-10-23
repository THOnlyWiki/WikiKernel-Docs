FROM eclipse-temurin:21-jre

WORKDIR /opt/wikikernel

# 把 build/dist 的内容复制到 examples/docker/wikikernel/ 后再构建。
COPY wikikernel/ /opt/wikikernel/

EXPOSE 18080

ENTRYPOINT ["java", "-jar", "wikikernel-server.jar"]
