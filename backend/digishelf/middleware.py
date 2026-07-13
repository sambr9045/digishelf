from urllib.parse import urlparse

import os


SEO_EXACT_PATHS = {"/sitemap.xml", "/robots.txt"}
INTERNAL_HOSTS = {
    "backend",
    "backend:8000",
    "digishelf-backend",
    "digishelf-backend:8000",
    "127.0.0.1:8000",
    "127.0.0.1:8009",
    "localhost:8000",
    "localhost:8009",
}


def _public_site_hostname():
    public_site_url = os.getenv("PUBLIC_SITE_URL", "").strip()
    if not public_site_url:
        # Fallback to defaults if env is empty
        return "digishelves.com"
    
    for candidate in public_site_url.split(","):
        candidate = candidate.strip()
        if not candidate:
            continue
        parsed = urlparse(candidate)
        hostname = parsed.hostname
        if hostname:
            # Prefer production domain over localhost
            if "localhost" not in hostname and "127.0.0.1" not in hostname:
                return hostname
    
    # If no non-localhost found, take the first one
    for candidate in public_site_url.split(","):
        candidate = candidate.strip()
        if not candidate:
            continue
        parsed = urlparse(candidate)
        if parsed.hostname:
            return parsed.hostname
    
    return ""


class SeoPublicProxyMiddleware:
    """
    nginx proxies /sitemap.xml and /robots.txt to Django over plain HTTP with
    Host: backend. Without forwarded headers, SECURE_SSL_REDIRECT issues
    https://backend/... redirects. Normalize these requests before SecurityMiddleware.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path in SEO_EXACT_PATHS:
            # Always set X-Forwarded-Proto for SEO paths
            if not request.META.get("HTTP_X_FORWARDED_PROTO"):
                request.META["HTTP_X_FORWARDED_PROTO"] = "https"

            # Check current Host header
            host = (request.META.get("HTTP_HOST") or "").lower()

            # Get the public host from env config
            public_host = _public_site_hostname()

            # If host is internal (backend, localhost, 127.0.0.1) OR empty, replace with public host
            if not host or host in INTERNAL_HOSTS:
                if public_host:
                    request.META["HTTP_HOST"] = public_host
                    request.META["HTTP_X_FORWARDED_HOST"] = public_host

        return self.get_response(request)
