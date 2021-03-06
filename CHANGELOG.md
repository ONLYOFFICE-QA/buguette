# Change log

## master (unreleased)

### New Features

* Add `About` window with versioning info
* Add `Android Projects App` product

### Fixes

* Fix incorrect product name for plugins
* Fix search terms reset on page refresh (#213)

### Changes

* Always restart `nginx` container
* Use `alpine` as base of `nginx` container
* Actualize nginx container version to 1.18
* Replace deprecated `--prod=true` command on build
* Remove one Docker layer with COPY
* Use multistage `Dockerfile`, instead of complicated `docker-compose`

## v1.0.0 (2020-11-24)

Last version with Dmitry.Rotaty as stuff member

### New Features

* First stable release
* Add `markdownlint` support in CI
