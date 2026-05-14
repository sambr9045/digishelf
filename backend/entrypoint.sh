#!/bin/sh
set -e

python manage.py migrate --noinput
gunicorn digishelf.wsgi:application --bind 0.0.0.0:8000 --workers 3
