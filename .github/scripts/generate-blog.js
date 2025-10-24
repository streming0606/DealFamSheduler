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

console.log('✅ API Key found');

const genAI = new GoogleGenerativeAI(API_KEY);

// CRITICAL FIX: Use the correct model name as of October 2025
// Options: 'gemini-2.0-flash' or 'gemini-flash-latest'
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
});

console.log('✅ Model initialized: gemini-2.0-flash');

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
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
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
5. Use HTML formatting ONLY with these tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a>
6. Include emojis where appropriate to make content engaging
7. Length: 800-1200 words
8. Include ONE internal link to https://thriftmaal.com naturally in the content
9. Structure: Introduction paragraph → Main sections with <h2> or <h3> subheadings → Pro tips section → Brief conclusion
10. Make it rank-worthy on Google with proper heading hierarchy and content structure

DO NOT include:
- Any AI-sounding phrases like "in conclusion", "in summary", "it's important to note"
- Generic templates
- Any markdown formatting (NO ** or # symbols)
- External links except the one ThriftMaal.com link

DO include:
- Specific examples, numbers, dates where relevant
- Actionable insights
- Natural keyword integration
- Emojis in headings and content

Generate ONLY the HTML content body. Start directly with content (no title needed - we have that already).`;

  try {
    console.log('⏳ Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();
    console.log('✅ Content generated successfully');
    return content.trim();
  } catch (error) {
    console.error('❌ Error generating blog content:', error.message);
    if (error.response) {
      console.error('Response error:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Function to generate AI summary
async function generateAISummary(content, title) {
  const cleanContent = content.replace(/<[^>]*>/g, ' ').substring(0, 800);
  const prompt = `Summarize this blog post in ONE sentence (maximum 120 characters):
Title: ${title}
Content: ${cleanContent}

Provide ONLY the summary sentence, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let summary = response.text().trim();
    // Ensure it's not too long
    if (summary.length > 150) {
      summary = summary.substring(0, 147) + '...';
    }
    return summary;
  } catch (error) {
    console.error('⚠️ Warning: Could not generate AI summary:', error.message);
    return `Complete guide to ${title}. Expert insights from ThriftMaal.`;
  }
}

// Function to generate article summary
async function generateSummary(title, keywords) {
  const prompt = `Write a compelling summary (120-140 characters) for a blog post titled "${title}" focusing on: ${keywords}. Make it engaging and SEO-friendly. Output ONLY the summary text.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let summary = response.text().trim();
    // Ensure it's not too long
    if (summary.length > 150) {
      summary = summary.substring(0, 147) + '...';
    }
    return summary;
  } catch (error) {
    console.error('⚠️ Warning: Could not generate summary:', error.message);
    return `Complete guide to ${title}. Expert tips and deals from ThriftMaal.`;
  }
}

// Function to get Unsplash image URL based on category
function getImageURL(category) {
  const imageIds = {
    'Shopping Guide': '1607082348824-0a96f2a4b9da',
    'Tech Guide': '1519389950473-47ba0277781c',
    'Fashion': '1445205170230-053b83016050',
    'Home & Kitchen': '1556911220-bff31c812dba',
    'Electronics': '1498049794561-7780e7231661'
  };
  
  const photoId = imageIds[category] || '1607082348824-0a96f2a4b9da';
  return `https://images.unsplash.com/photo-${photoId}?w=800`;
}

// Main function
async function main() {
  try {
    console.log('🤖 Starting blog post generation...\n');
    
    // Read topics file
    const topicsPath = path.join(__dirname, 'topics.json');
    console.log('📂 Topics path:', topicsPath);
    
    if (!fs.existsSync(topicsPath)) {
      console.error('❌ topics.json file not found at:', topicsPath);
      process.exit(1);
    }
    
    const topicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
    console.log('✅ Topics file loaded');
    
    // Read existing posts
    const postsPath = path.join(__dirname, '../../blog/data/posts.json');
    console.log('📂 Posts path:', postsPath);
    
    if (!fs.existsSync(postsPath)) {
      console.error('❌ posts.json file not found at:', postsPath);
      process.exit(1);
    }
    
    const existingPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    console.log('✅ Posts file loaded');
    
    // Find unprocessed topic
    if (!topicsData.topics || topicsData.topics.length === 0) {
      console.log('⚠️ No topics found in topics.json - nothing to generate');
      process.exit(0);
    }
    
    const topic = topicsData.topics[0];
    console.log(`\n📝 Generating post: "${topic.title}"`);
    console.log(`📁 Category: ${topic.category}`);
    console.log(`🔑 Keywords: ${topic.keywords}\n`);
    
    // Generate blog content
    console.log('Step 1/3: Generating main content...');
    const content = await generateBlogPost(topic);
    console.log(`✅ Content generated (${content.length} characters)\n`);
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Step 2/3: Generating summary...');
    const summary = await generateSummary(topic.title, topic.keywords);
    console.log(`✅ Summary: ${summary}\n`);
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Step 3/3: Generating AI summary...');
    const aiSummary = await generateAISummary(content, topic.title);
    console.log(`✅ AI Summary: ${aiSummary}\n`);
    
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
    
    console.log('\n🎉 Blog generation completed successfully!');
    console.log(`📄 Title: ${newPost.title}`);
    console.log(`🔗 Slug: ${newPost.slug}`);
    console.log(`📅 Date: ${newPost.date}`);
    console.log(`⏱️ Read time: ${newPost.readTime}`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();
