import AsyncStorage from '@react-native-async-storage/async-storage';

const REPO_OWNER = 'YOUR_USERNAME';
const REPO_NAME = 'YOUR_REPO';
const POSTS_PATH = 'src/content/post';

export const githubAPI = {
  // Get all blog posts
  async getPosts() {
    const token = await AsyncStorage.getItem('github_token');
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}`,
      {
        headers: { 'Authorization': `token ${token}` }
      }
    );
    return response.json();
  },

  // Get single post content
  async getPost(filename) {
    const token = await AsyncStorage.getItem('github_token');
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      {
        headers: { 'Authorization': `token ${token}` }
      }
    );
    const data = await response.json();
    // Decode base64 content
    return atob(data.content);
  },

  // Create or update post
  async savePost(filename, frontmatter, content, sha = null) {
    const token = await AsyncStorage.getItem('github_token');
    
    const mdxContent = `---
title: "${frontmatter.title}"
description: "${frontmatter.description}"
pubDate: "${frontmatter.pubDate || new Date().toISOString()}"
coverImage: "${frontmatter.coverImage}"
---

${content}`;

    const body = {
      message: sha ? `Update: ${frontmatter.title}` : `Add: ${frontmatter.title}`,
      content: btoa(mdxContent), // Base64 encode
    };
    
    if (sha) body.sha = sha; // Required for updates

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    return response.json();
  },

  // Delete post
  async deletePost(filename, sha) {
    const token = await AsyncStorage.getItem('github_token');
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete: ${filename}`,
          sha: sha,
        }),
      }
    );
    return response.json();
  }
};