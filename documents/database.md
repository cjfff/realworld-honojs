## database create command with docker

--name real_world

- MYSQL_ROOT_PASSWORD pw can replace to your custom password
-v path path can replace to you local file path

```bash
docker run --name real_world MYSQL_PASSWORD=:pw -v path:/var/lib/mysql -d -p 3306:3306 mysql:5.7

<!-- full example -->
docker run --name='real_world' -e MYSQL_ROOT_PASSWORD=realworld -v ~/database/mysql/realworld:/var/lib/mysql -d -p 3306:3306 mysql:5.7
```

## how to go inside the mysql container

```bash
docker exec -it real_world bash
```
