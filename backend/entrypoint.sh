#!/bin/sh
set -e

mkdir -p "${DJANGO_CACHE_DIR:-/app/.django_cache}"

python manage.py migrate --noinput
gunicorn digishelf.wsgi:application --bind 0.0.0.0:8000 --workers 3
