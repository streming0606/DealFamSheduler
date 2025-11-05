
#!/usr/bin/env node

/**
 * Generate sitemap.xml from posts.json
 * Run: node blog/generate-sitemap.js
 * Or automatically via GitHub Actions workflow
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname);
const POSTS_FILE = path.join(BLOG_DIR, 'data', 'posts.json');
const SITEMAP_FILE = path.join(BLOG_DIR, 'sitemap.xml');
const DOMAIN = 'https://thriftmaal.com';

async function generateSitemap() {
  try {
    // Read posts.json
    if (!fs.existsSync(POSTS_FILE)) {
      console.error(`❌ posts.json not found at ${POSTS_FILE}`);
      process.exit(1);
    }

    const postsData = fs.readFileSync(POSTS_FILE, 'utf8');
    const posts = JSON.parse(postsData);

    if (!Array.isArray(posts)) {
      console.error('❌ posts.json must be an array');
      process.exit(1);
    }

    console.log(`✅ Found ${posts.length} posts`);

    // Build sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add blog root
    xml += '  <!-- Blog listing page -->\n';
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}/blog/</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n\n';

    // Add each post
    xml += '  <!-- Auto-generated blog posts -->\n';
    posts.forEach((post, idx) => {
      if (!post.slug) {
        console.warn(`⚠️ Post ${idx} missing slug, skipping`);
        return;
      }

      const lastmod = post.datePublished || post.date || new Date().toISOString().split('T')[0];
      // Extract just the date part
      const lastmodDate = lastmod.split('T')[0];

      xml += '  <url>\n';
      xml += `    <loc>${DOMAIN}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastmodDate}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>\n';

    // Write sitemap
    fs.writeFileSync(SITEMAP_FILE, xml);
    console.log(`✅ Sitemap generated: ${SITEMAP_FILE}`);
    console.log(`📄 Total URLs: ${posts.length + 1} (1 root + ${posts.length} posts)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

generateSitemap();
