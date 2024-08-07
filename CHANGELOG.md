# Change log

## master (unreleased)

### New Features

* Add `About` window with versioning info
* Add `Android Projects App` product
* Add `DocumentServer Installation` product
* Add `PDF Editor` product
* Add `PDF Form` product
* Add `yamllint` in CI
* Add `/.angular/cache` to `.gitignore`
* Add `github-actions` check to `dependabot`
* Add `eslint` as CI stage

### Fixes

* Fix incorrect product name for plugins
* Fix search terms reset on page refresh (#213)
* Actualize `nodejs` version in CI
* Fix error on quick search with `:` symbol
* Fix error in quick search if no text entered
* Fix request for getting product versions ([#1251](https://github.com/ONLYOFFICE-QA/buguette/issues/1251))
* Fix several eslint errors

### Changes

* Always restart `nginx` container
* Use `alpine` as base of `nginx` container
* Actualize nginx container version to 1.18
* Replace deprecated `--prod=true` command on build
* Remove one Docker layer with COPY
* Use multistage `Dockerfile`, instead of complicated `docker compose`
* Check `dependabot` at 8:00 Moscow time daily

## v1.0.0 (2020-11-24)

Last version with Dmitry.Rotaty as stuff member

### New Features

* First stable release
* Add `markdownlint` support in CI
