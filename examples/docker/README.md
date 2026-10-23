# Docker 示例

这个目录不会自动包含发行包。先在主仓库构建：

```bash
./gradlew dist
```

然后把 `build/dist` 的内容复制到 `examples/docker/wikikernel/`：

```bash
mkdir -p examples/docker/wikikernel
cp -r build/dist/. examples/docker/wikikernel/
```

再启动：

```bash
cd examples/docker
docker compose up -d
```

在浏览器打开 `http://localhost:18080/init`。

`compose.yaml` 把整个 `wikikernel/` 目录挂载到容器内，因此数据库、上传文件和
`LocalSettings.yaml` 都会保留在宿主机。

如果不想挂载，也可以直接使用 `Dockerfile` 把发行包打进镜像；此时需要为
`data/`、`run/files/`、`plugins/` 和 `LocalSettings.yaml` 规划持久化卷。
