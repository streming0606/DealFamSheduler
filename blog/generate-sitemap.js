#!/usr/bin/env node

/**
 * Generate sitemap.xml from posts.json
 * ThriftMaal Blog Sitemap Generator
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BLOG_DIR = __dirname;
const POSTS_FILE = path.join(BLOG_DIR, 'data', 'posts.json');
const SITEMAP_FILE = path.join(BLOG_DIR, 'sitemap.xml');
const DOMAIN = 'https://thriftmaal.com';

function generateSitemap() {
  try {
    console.log('Starting sitemap generation...');
    
    // Check if posts.json exists
    if (!fs.existsSync(POSTS_FILE)) {
      console.error('ERROR: posts.json not found at:', POSTS_FILE);
      process.exit(1);
    }

    // Read and parse posts.json
    const postsData = fs.readFileSync(POSTS_FILE, 'utf8');
    const posts = JSON.parse(postsData);

    if (!Array.isArray(posts)) {
      console.error('ERROR: posts.json must be an array');
      process.exit(1);
    }

    console.log('Found', posts.length, 'posts');

    // Build sitemap XML
    const today = new Date().toISOString().split('T')[0];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add blog root URL
    xml += '  <!-- Blog listing page -->\n';
    xml += '  <url>\n';
    xml += '    <loc>' + DOMAIN + '/blog/</loc>\n';
    xml += '    <lastmod>' + today + '</lastmod>\n';
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n\n';

    // Add each blog post
    xml += '  <!-- Auto-generated blog posts -->\n';
    posts.forEach(function(post, idx) {
      if (!post.slug) {
        console.warn('WARNING: Post at index', idx, 'missing slug, skipping');
        return;
      }

      // Extract date from datePublished or date field
      let lastmod = today;
      if (post.datePublished) {
        lastmod = post.datePublished.split('T')[0];
      } else if (post.date) {
        // Try to parse date string like "November 4, 2025"
        const dateObj = new Date(post.date);
        if (!isNaN(dateObj.getTime())) {
          lastmod = dateObj.toISOString().split('T')[0];
        }
      }

      xml += '  <url>\n';
      xml += '    <loc>' + DOMAIN + '/blog/' + post.slug + '</loc>\n';
      xml += '    <lastmod>' + lastmod + '</lastmod>\n';
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>\n';

    // Write sitemap file
    fs.writeFileSync(SITEMAP_FILE, xml, 'utf8');
    
    console.log('SUCCESS: Sitemap generated at:', SITEMAP_FILE);
    console.log('Total URLs:', posts.length + 1, '(1 root + ' + posts.length + ' posts)');
    
    process.exit(0);
    
  } catch (error) {
    console.error('ERROR generating sitemap:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();
