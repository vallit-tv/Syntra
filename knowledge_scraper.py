import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse

class SimpleScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'SyntraBot/1.0 (AI Assistant; +https://vallit.net)'
        }
        self.visited = set()

    def scrape_url(self, url, max_pages=5, current_depth=0, max_depth=1):
        """
        Scrape text content from a URL and potentially internal links.
        Returns a list of dicts with title, content, url.
        """
        results = []
        
        # Ensure URL has schema
        if not url.startswith('http'):
            url = 'https://' + url
            
        if url in self.visited:
            return []
        
        self.visited.add(url)
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                print(f"Failed to fetch {url}: {response.status_code}")
                return []

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Clean up script and style elements
            for element in soup(["script", "style", "nav", "footer", "header", "noscript", "svg"]):
                element.extract()

            # Get clean text
            text = self._clean_text(soup.get_text(separator=' '))
            title = soup.title.string.strip() if soup.title else url

            if text:
                results.append({
                    'title': title,
                    'content': text,
                    'url': url,
                    'status': 'success'
                })
                
            # Recursive crawling for internal links if enabled
            if current_depth < max_depth and len(self.visited) < max_pages:
                domain = urlparse(url).netloc
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(url, href)
                    parsed_url = urlparse(full_url)
                    
                    # Only internal links, ignore anchors
                    if parsed_url.netloc == domain and '#' not in href:
                        if full_url not in self.visited:
                             sub_results = self.scrape_url(full_url, max_pages, current_depth + 1, max_depth)
                             results.extend(sub_results)
                             if len(self.visited) >= max_pages:
                                 break
        
            return results
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return [{
                'url': url,
                'error': str(e),
                'status': 'error'
            }]

    def _clean_text(self, text):
        """Clean extra whitespace and noise"""
        # Collapse multiple spaces
        text = re.sub(r'\s+', ' ', text)
        # Remove empty lines
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return '\n'.join(lines)
