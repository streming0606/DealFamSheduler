import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to calculate read time
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Function to generate SEO-optimized blog content
async function generateBlogPost(topic) {
  const prompt = `You are an expert content writer specializing in SEO-optimized, engaging, and informational blog posts for ThriftMaal.com - a deals and shopping guide website.

Write a comprehensive, 100% original, humanized blog post on the following topic:
Title: "${topic.title}"
Category: "${topic.category}"
Keywords: "${topic.keywords}"

Requirements:
1. Write in a natural, conversational, and engaging tone that sounds completely human
2. Create 100% original content with zero plagiarism
3. Optimize for SEO with proper keyword placement (but avoid keyword stuffing)
4. Include practical tips, actionable advice, and real value for readers
5. Use HTML formatting with <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a> tags
6. Include emojis where appropriate to make content engaging
7. Length: 800-1200 words
8. Include internal link to https://thriftmaal.com in the content naturally
9. Structure: Introduction → Main sections with subheadings → Pro tips → Conclusion
10. Make it rank-worthy on Google with proper heading hierarchy and content structure

DO NOT include any AI-sounding phrases like "in conclusion", "in summary", "it's important to note"
DO NOT use generic templates - make each sentence unique and valuable
DO include specific examples, numbers, dates, and actionable insights

Generate ONLY the HTML content body without any meta descriptions or titles. Start directly with content.`;

  const result = await model.generateContent(prompt);
  const content = result.response.text();
  
  return content;
}

// Function to generate AI summary
async function generateAISummary(content, title) {
  const prompt = `Summarize the following blog post in 1-2 concise sentences (max 150 characters):
Title: ${title}
Content: ${content.replace(/<[^>]*>/g, ' ').substring(0, 1000)}...

Provide only the summary, nothing else.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// Function to generate article summary
async function generateSummary(title, keywords) {
  const prompt = `Write a compelling 150-character summary for a blog post titled "${title}" with focus on keywords: ${keywords}. Make it engaging and SEO-friendly.`;
  
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// Function to get random Unsplash image URL based on topic
function getImageURL(category) {
  const imageKeywords = {
    'Shopping Guide': 'shopping-bags-deals',
    'Tech Guide': 'technology-gadgets',
    'Fashion': 'fashion-clothing',
    'Home & Kitchen': 'home-decor',
    'Electronics': 'electronics-devices'
  };
  
  const keyword = imageKeywords[category] || 'shopping-deals';
  const randomId = Math.floor(Math.random() * 10000);
  return `https://images.unsplash.com/photo-${randomId}?w=800`;
}

// Main function
async function main() {
  try {
    console.log('🤖 Starting blog post generation...');
    
    // Read topics file
    const topicsPath = path.join(__dirname, 'topics.json');
    const topicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
    
    // Read existing posts
    const postsPath = path.join(__dirname, '../../blog/data/posts.json');
    const existingPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    
    // Find unprocessed topic (first topic in the list)
    if (topicsData.topics.length === 0) {
      console.log('⚠️ No topics found in topics.json');
      return;
    }
    
    const topic = topicsData.topics[0];
    console.log(`📝 Generating post: ${topic.title}`);
    
    // Generate blog content
    const content = await generateBlogPost(topic);
    const summary = await generateSummary(topic.title, topic.keywords);
    const aiSummary = await generateAISummary(content, topic.title);
    
    // Create post object
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const datePublished = today.toISOString().split('T')[0];
    
    const newPost = {
      title: topic.title,
      slug: generateSlug(topic.title),
      category: topic.category,
      date: dateString,
      datePublished: datePublished,
      readTime: calculateReadTime(content),
      image: getImageURL(topic.category),
      summary: summary,
      keywords: topic.keywords,
      aiSummary: aiSummary,
      content: content
    };
    
    // Add to beginning of posts array
    existingPosts.unshift(newPost);
    
    // Write updated posts.json
    fs.writeFileSync(postsPath, JSON.stringify(existingPosts, null, 2));
    console.log('✅ Blog post added to posts.json');
    
    // Remove processed topic from topics.json
    topicsData.topics.shift();
    fs.writeFileSync(topicsPath, JSON.stringify(topicsData, null, 2));
    console.log('✅ Topic removed from topics.json');
    
    console.log('🎉 Blog generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error generating blog:', error);
    process.exit(1);
  }
}

main();
