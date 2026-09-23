#!/usr/bin/env bash

set -euo pipefail

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

ROOT="/var/www/sumcoinprice-react"
WEB="/var/www/sumcoinprice"
LOCK="/var/lock/sumcoinprice-seo.lock"

exec 9>"$LOCK"

if ! flock -n 9; then
  exit 0
fi

cd "$ROOT"

node scripts/refresh-live.mjs

rsync \
  -a \
  --exclude='.prerender-base.html' \
  --chown=www-data:www-data \
  dist/ \
  "$WEB/"
