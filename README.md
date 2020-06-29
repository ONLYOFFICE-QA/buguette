# Buguette

This is a web application for working with bugzilla

## Build
To build and run this all, you need to use 

```docker-compose up```

By default, app using 80 port, it must be free before runing;

## Update

For easy update you need to use
```
git pull
docker-compose build --no-cache buguette-build 
docker-compose up buguette-build
```
