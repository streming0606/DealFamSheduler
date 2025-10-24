import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI with API key
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// CRITICAL FIX: Use gemini-1.5-flash instead of gemini-1.5-pro
// gemini-1.5-flash is more reliable and doesn't require v1beta API
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash'
});

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
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).length;
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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    return content;
  } catch (error) {
    console.error('❌ Error generating blog content:', error.message);
    throw error;
  }
}

// Function to generate AI summary
async function generateAISummary(content, title) {
  const prompt = `Summarize the following blog post in 1-2 concise sentences (max 150 characters):
Title: ${title}
Content: ${content.replace(/<[^>]*>/g, ' ').substring(0, 1000)}...

Provide only the summary, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('⚠️ Warning: Could not generate AI summary:', error.message);
    return `${title} - Expert guide and tips from ThriftMaal`;
  }
}

// Function to generate article summary
async function generateSummary(title, keywords) {
  const prompt = `Write a compelling 150-character summary for a blog post titled "${title}" with focus on keywords: ${keywords}. Make it engaging and SEO-friendly. Provide only the summary text.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('⚠️ Warning: Could not generate summary:', error.message);
    return `Complete guide to ${title}. Expert tips and insights from ThriftMaal.`;
  }
}

// Function to get random Unsplash image URL based on topic
function getImageURL(category) {
  const imageKeywords = {
    'Shopping Guide': '1607082348824-0a96f2a4b9da',
    'Tech Guide': '1519389950473-47ba0277781c',
    'Fashion': '1445205170230-053b83016050',
    'Home & Kitchen': '1556911220-bff31c812dba',
    'Electronics': '1498049794561-7780e7231661'
  };
  
  const photoId = imageKeywords[category] || '1607082348824-0a96f2a4b9da';
  return `https://images.unsplash.com/photo-${photoId}?w=800`;
}

// Main function
async function main() {
  try {
    console.log('🤖 Starting blog post generation...');
    
    // Read topics file
    const topicsPath = path.join(__dirname, 'topics.json');
    
    if (!fs.existsSync(topicsPath)) {
      console.error('❌ topics.json file not found at:', topicsPath);
      process.exit(1);
    }
    
    const topicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
    
    // Read existing posts
    const postsPath = path.join(__dirname, '../../blog/data/posts.json');
    
    if (!fs.existsSync(postsPath)) {
      console.error('❌ posts.json file not found at:', postsPath);
      process.exit(1);
    }
    
    const existingPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    
    // Find unprocessed topic (first topic in the list)
    if (!topicsData.topics || topicsData.topics.length === 0) {
      console.log('⚠️ No topics found in topics.json');
      process.exit(0);
    }
    
    const topic = topicsData.topics[0];
    console.log(`📝 Generating post: ${topic.title}`);
    
    // Generate blog content
    console.log('⏳ Generating content...');
    const content = await generateBlogPost(topic);
    
    console.log('⏳ Generating summary...');
    const summary = await generateSummary(topic.title, topic.keywords);
    
    console.log('⏳ Generating AI summary...');
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
    console.log(`📄 Generated: ${newPost.title}`);
    console.log(`🔗 Slug: ${newPost.slug}`);
    
  } catch (error) {
    console.error('❌ Error generating blog:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

main();
