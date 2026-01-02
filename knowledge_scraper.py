import requests
from bs4 import BeautifulSoup
import re

class SimpleScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'SyntraBot/1.0 (AI Assistant; +https://vallit.net)'
        }

    def scrape_url(self, url):
        """
        Scrape text content from a URL.
        Returns a dict with title and content.
        """
        try:
            # Ensure URL has schema
            if not url.startswith('http'):
                url = 'https://' + url

            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Clean up script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.extract()

            # Get text
            text = soup.get_text()

            # Break into lines and remove leading/trailing space on each
            lines = (line.strip() for line in text.splitlines())
            # Break multi-headlines into a line each
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            # Drop blank lines
            text = '\n'.join(chunk for chunk in chunks if chunk)

            title = soup.title.string if soup.title else url

            return {
                'title': title,
                'content': text,
                'url': url,
                'status': 'success'
            }
        except Exception as e:
            return {
                'url': url,
                'error': str(e),
                'status': 'error'
            }
