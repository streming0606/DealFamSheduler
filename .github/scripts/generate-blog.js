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

// Use gemini-2.0-flash model
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

// Helper function to clean markdown code blocks from content
function cleanMarkdownCodeBlocks(text) {
  // Remove `````` at the end
  let cleaned = text.trim();
  
  // Remove opening code block markers (``````HTML, ```
  cleaned = cleaned.replace(/^```html\n?/i, '');
  cleaned = cleaned.replace(/^```
  
  // Remove closing code block markers (```)
  cleaned = cleaned.replace(/\n?```
  cleaned = cleaned.replace(/```$/, '');
  
  return cleaned.trim();
}

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
  const prompt = `You are an expert content writer for ThriftMaal.com - a deals and shopping guide website in India.

Write a comprehensive, SEO-optimized blog post on:
Title: "${topic.title}"
Category: "${topic.category}"
Keywords: "${topic.keywords}"

CRITICAL FORMATTING INSTRUCTIONS:
- Output ONLY pure HTML content with NO markdown formatting
- DO NOT wrap the output in code blocks (NO \`\`\`html or \`\`\`)
- DO NOT use any markdown syntax
- Start directly with HTML tags like <h2> or <p>
- Use ONLY these HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <a>

CONTENT REQUIREMENTS:
1. Write 800-1200 words in natural, conversational, human tone
2. 100% original content with zero plagiarism
3. SEO-optimized with natural keyword placement
4. Include practical tips and actionable advice
5. Add emojis in headings and text for engagement
6. Include ONE link to https://thriftmaal.com naturally in content
7. Structure: Introduction → Main sections with headings → Pro tips → Conclusion

AVOID:
- AI phrases like "in conclusion", "in summary", "it's important to note"
- Generic templates
- Any markdown formatting
- Code blocks or backticks
- External links except ThriftMaal.com

START YOUR RESPONSE DIRECTLY WITH HTML CONTENT (NO EXPLANATIONS, NO CODE BLOCKS):`;

  try {
    console.log('⏳ Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text();
    
    // Clean markdown code blocks if present
    content = cleanMarkdownCodeBlocks(content);
    
    console.log('✅ Content generated and cleaned');
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
  const prompt = `Summarize this blog post in ONE sentence (maximum 120 characters). Output ONLY the summary text with NO markdown, NO code blocks, NO backticks:

Title: ${title}
Content: ${cleanContent}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let summary = response.text().trim();
    
    // Clean any markdown formatting
    summary = cleanMarkdownCodeBlocks(summary);
    summary = summary.replace(/^["']|["']$/g, ''); // Remove quotes if added
    
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
  const prompt = `Write a compelling 120-140 character summary for: "${title}" focusing on: ${keywords}. Make it SEO-friendly. Output ONLY the summary text with NO markdown, NO code blocks, NO backticks.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let summary = response.text().trim();
    
    // Clean any markdown formatting
    summary = cleanMarkdownCodeBlocks(summary);
    summary = summary.replace(/^["']|["']$/g, ''); // Remove quotes if added
    
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
    console.log(`✅ Content generated (${content.length} characters)`);
    console.log(`📄 Content preview: ${content.substring(0, 100)}...\n`);
    
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
