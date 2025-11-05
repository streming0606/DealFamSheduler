// ===========================
// ThriftMaal Blog - Clean URL SPA
// ===========================

let allPosts = [];
let currentCategory = 'all';

// DOM
const controls = document.getElementById('controls');
const blogContainer = document.getElementById('blogContainer');
const postRoot = document.getElementById('postRoot');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('noResults');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Init
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('./data/posts.json', { cache: 'no-store' });
    allPosts = await res.json();
  } catch (e) {
    console.error('Failed to load posts.json', e);
    return;
  }

  // If redirected from /404.html, extract slug and open post
  if (sessionStorage.redirect) {
    const original = sessionStorage.redirect;
    delete sessionStorage.redirect;
    const slug = extractSlugFromURL(original);
    if (slug) {
      history.replaceState({ slug }, '', `/blog/${slug}`);
      return renderPost(slug);
    }
  }

  // If already on a clean slug path (client-side navigation)
  const maybeSlug = extractSlugFromURL(location.href);
  if (maybeSlug) {
    return renderPost(maybeSlug);
  }

  // Otherwise show listing
  renderListing(allPosts);
  wireUI();
});

// Extract slug after /blog/
function extractSlugFromURL(url) {
  const a = document.createElement('a');
  a.href = url;
  const parts = a.pathname.split('/').filter(Boolean);
  const blogIndex = parts.indexOf('blog');
  const slug = blogIndex > -1 ? parts.slice(blogIndex + 1).join('/') : '';
  return slug || null;
}

// Render listing
function renderListing(posts) {
  document.title = 'ThriftMaal Blog - Buying Guides & Deals';
  setListingMeta();
  controls.style.display = '';
  postRoot.style.display = 'none';
  document.getElementById('listing').style.display = '';
  blogContainer.innerHTML = posts.map(cardHTML).join('');
  noResults.style.display = posts.length ? 'none' : '';
}

// Card HTML
function cardHTML(post) {
  return `
  <div class="blog-card" onclick="navigateToPost('${post.slug}')">
    <img src="${post.image}" alt="${post.title}" loading="lazy" />
    <div class="blog-info">
      <span class="blog-category">${post.category}</span>
      <h3>${post.title}</h3>
      <p>${post.summary}</p>
      <div class="blog-meta">
        <span>📅 ${post.date}</span>
        <span>⏱️ ${post.readTime}</span>
      </div>
      <a class="btn" href="/blog/${post.slug}" onclick="event.preventDefault(); navigateToPost('${post.slug}')">Read More</a>
    </div>
  </div>`;
}

// Navigate to post (clean URL)
function navigateToPost(slug) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState({ slug }, '', `/blog/${slug}`);
  renderPost(slug);
}

// Render single post
function renderPost(slug) {
  const post = allPosts.find(p => p.slug === slug);
  if (!post) {
    // Fallback to listing if slug invalid
    history.replaceState({}, '', '/blog/');
    return renderListing(allPosts);
  }

  // Update metas
  setPostMeta(post);

  // Switch views
  controls.style.display = 'none';
  document.getElementById('listing').style.display = 'none';
  postRoot.style.display = '';

  // Related posts
  const related = allPosts.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  postRoot.innerHTML = `
    <a href="/blog/" class="back-to-blog" onclick="event.preventDefault(); backToListing()">← Back to Blog</a>

    <article class="post-container">
      <div class="post-header">
        <span class="post-category">${post.category}</span>
        <h1 class="post-title">${post.title}</h1>
        <div class="post-meta">
          <span>👤 <strong>ThriftMaal Team</strong></span>
          <span>📅 ${post.date}</span>
          <span>⏱️ ${post.readTime}</span>
        </div>
      </div>

      <img src="${post.image}" alt="${post.title}" class="post-banner" />

      <section class="ai-summary">
        <h3>🧾 Quick Summary</h3>
        <p>${post.aiSummary || post.summary}</p>
      </section>

      <div class="post-content">${post.content}</div>
    </article>

    ${related.length ? `
    <section class="related-posts">
      <h2>📚 Related Articles</h2>
      <div class="related-grid">
        ${related.map(r => `
          <div class="related-card" onclick="navigateToPost('${r.slug}')">
            <img src="${r.image}" alt="${r.title}" />
            <div class="related-card-content">
              <h3>${r.title}</h3>
              <p>${r.summary.substring(0, 100)}...</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>` : ''}
  `;
}

// Back to listing
function backToListing() {
  history.pushState({}, '', '/blog/');
  renderListing(allPosts);
}

// Dynamic meta for listing
function setListingMeta() {
  ensureCanonical('https://thriftmaal.com/blog/');
  setOG({
    title: 'ThriftMaal Blog - Buying Guides & Deals',
    description: 'Expert buying guides, product tips, and best deals in India on the ThriftMaal Blog.',
    url: 'https://thriftmaal.com/blog/',
    image: 'https://thriftmaal.com/images/logo/logo.png'
  });
  setMetaDescription('Expert buying guides, product tips, and best deals in India on the ThriftMaal Blog.');
  document.title = 'ThriftMaal Blog - Buying Guides & Deals';
}

// Dynamic meta for post
function setPostMeta(post) {
  const url = `https://thriftmaal.com/blog/${post.slug}`;
  ensureCanonical(url);
  setOG({
    title: post.title,
    description: post.summary,
    url,
    image: post.image
  });
  setMetaDescription(post.summary);
  document.title = `${post.title} - ThriftMaal Blog`;

  // Structured data
  const oldLd = document.querySelector('script[type="application/ld+json"]');
  if (oldLd) oldLd.remove();
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    author: { "@type": "Person", name: "ThriftMaal Team" },
    publisher: { "@type": "Organization", name: "ThriftMaal", logo: "https://thriftmaal.com/images/logo/logo.png" },
    description: post.summary,
    image: post.image,
    datePublished: post.datePublished || post.date,
    url
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
}

// Utilities to manage meta tags
function ensureCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}
function setMetaDescription(content) {
  let m = document.querySelector('meta[name="description"]');
  if (!m) {
    m = document.createElement('meta');
    m.setAttribute('name', 'description');
    document.head.appendChild(m);
  }
  m.setAttribute('content', content);
}
function setOG({ title, description, url, image }) {
  setOgTag('og:title', title);
  setOgTag('og:description', description);
  setOgTag('og:url', url);
  setOgTag('og:image', image);
}
function setOgTag(property, content) {
  let m = document.querySelector(`meta[property="${property}"]`);
  if (!m) {
    m = document.createElement('meta');
    m.setAttribute('property', property);
    document.head.appendChild(m);
  }
  m.setAttribute('content', content);
}

// Filters and search
function applyFilters(query = '') {
  let filtered = [...allPosts];
  if (currentCategory !== 'all') filtered = filtered.filter(p => p.category === currentCategory);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.keywords || '').toLowerCase().includes(q)
    );
  }
  renderListing(filtered);
}

// Wire UI
function wireUI() {
  filterButtons.forEach(b => b.addEventListener('click', (e) => {
    filterButtons.forEach(x => x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    currentCategory = e.currentTarget.dataset.category;
    applyFilters(searchInput.value.trim());
  }));
  searchInput.addEventListener('input', (e) => applyFilters(e.target.value));

  if (hamburger) hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
}

// Browser back/forward
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.slug) {
    renderPost(e.state.slug);
  } else {
    renderListing(allPosts);
  }
});
