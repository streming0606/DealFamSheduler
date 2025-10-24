THRIFT MAAL BLOG SECTION - IMPLEMENTATION GUIDE
📦 Package Contents
This complete blog section includes:

blog.html - Main blog listing page

blog-post.html - Individual blog post template

blog.css - Complete blog styling (mobile-first, responsive)

blog.js - Blog listing page JavaScript

blog-post.js - Individual blog post JavaScript

blog-data.json - Sample blog posts data (12 articles)

sitemap.xml - SEO sitemap for search engines

robots.txt - Crawler instructions

🚀 Quick Start Installation
Step 1: File Structure Setup
Create this folder structure in your website root:

text
thriftmaal.com/
├── blog/
│   ├── index.html (rename blog.html to index.html)
│   └── festival-sales/
│   └── shopping-tips/
│   └── product-guides/
│   └── student-discounts/
│   └── deals-offers/
│   └── brand-reviews/
├── css/
│   ├── style.css (your existing file)
│   └── blog.css (NEW - add this file)
├── js/
│   ├── blog.js (NEW - add this file)
│   └── blog-post.js (NEW - add this file)
├── data/
│   └── blog-data.json (NEW - add this file)
├── sitemap.xml (NEW - add this file to root)
└── robots.txt (NEW - add this file to root)
Step 2: Upload Files
Upload blog.css to /css/ folder

Upload blog.js to /js/ folder

Upload blog-post.js to /js/ folder

Upload blog-data.json to /data/ folder (create folder if needed)

Rename blog.html to index.html and upload to /blog/ folder

Upload blog-post.html as template for individual posts

Upload sitemap.xml to root directory

Upload robots.txt to root directory

Step 3: Create Blog Post Pages
For each blog post, create a folder structure like:

text
/blog/festival-sales/big-billion-days-shopping-guide-2025.html
Copy blog-post.html to each location and it will automatically load content from blog-data.json based on the URL slug.

🎨 Integration with Existing Website
Link Blog in Ma
