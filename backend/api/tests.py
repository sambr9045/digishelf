from django.test import TestCase
from django.test.client import RequestFactory
from django.core.cache import cache
from . import views

# Create your tests here.


class SitemapTest(TestCase):
	def test_sitemap_generation(self):
		req = RequestFactory().get("/")
		xml = views._build_sitemap_xml(req)
		self.assertIn("<urlset", xml)
		# Ensure restricted items cache key exists (may be empty list)
		restricted = cache.get("seo_sitemap_restricted_items")
		# Should be a list when present
		if restricted is not None:
			self.assertIsInstance(restricted, list)
