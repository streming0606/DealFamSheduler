import json
import os
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

# Paths
POSTS_JSON_PATH = 'blog/data/posts.json'
SITEMAP_PATH = 'blog/sitemap.xml'
BASE_URL = 'https://thriftmaal.com'

def prettify_xml(elem):
    """Return a pretty-printed XML string for the Element."""
    rough_string = tostring(elem, encoding='utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ", encoding='utf-8').decode('utf-8')

def generate_sitemap():
    """Generate sitemap.xml from posts.json"""
    try:
        print('🚀 Starting sitemap generation...')
        
        # Read posts.json
        if not os.path.exists(POSTS_JSON_PATH):
            print(f'❌ Error: {POSTS_JSON_PATH} not found')
            return False
        
        with open(POSTS_JSON_PATH, 'r', encoding='utf-8') as f:
            posts = json.load(f)
        
        print(f'✅ Loaded {len(posts)} posts from posts.json')
        
        # Create XML structure
        urlset = Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        urlset.set('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1')
        
        # Add blog homepage
        url = SubElement(urlset, 'url')
        loc = SubElement(url, 'loc')
        loc.text = f'{BASE_URL}/blog'
        lastmod = SubElement(url, 'lastmod')
        lastmod.text = datetime.now().strftime('%Y-%m-%d')
        changefreq = SubElement(url, 'changefreq')
        changefreq.text = 'daily'
        priority = SubElement(url, 'priority')
        priority.text = '1.0'
        
        print('✅ Added blog homepage to sitemap')
        
        # Add each blog post
        for post in posts:
            url = SubElement(urlset, 'url')
            
            # Location - using your URL pattern
            loc = SubElement(url, 'loc')
            loc.text = f'{BASE_URL}/blog/posts/article?post={post["slug"]}'
            
            # Last modified date
            lastmod = SubElement(url, 'lastmod')
            lastmod.text = post.get('datePublished', datetime.now().strftime('%Y-%m-%d'))
            
            # Change frequency
            changefreq = SubElement(url, 'changefreq')
            changefreq.text = 'weekly'
            
            # Priority
            priority = SubElement(url, 'priority')
            priority.text = '0.8'
            
            # Image (if exists)
            if 'image' in post and post['image']:
                image_elem = SubElement(url, 'image:image')
                image_loc = SubElement(image_elem, 'image:loc')
                image_loc.text = post['image']
                image_title = SubElement(image_elem, 'image:title')
                image_title.text = post['title']
        
        print(f'✅ Added {len(posts)} blog posts to sitemap')
        
        # Generate pretty XML
        xml_string = prettify_xml(urlset)
        
        # Add XML declaration
        xml_declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
        final_xml = xml_declaration + '\n'.join(line for line in xml_string.split('\n') if line.strip() and '<?xml' not in line)
        
        # Write sitemap.xml
        with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
            f.write(final_xml)
        
        print(f'✅ Sitemap generated successfully: {SITEMAP_PATH}')
        print(f'📊 Total URLs in sitemap: {len(posts) + 1}')
        
        return True
        
    except Exception as e:
        print(f'❌ Error generating sitemap: {str(e)}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = generate_sitemap()
    exit(0 if success else 1)
