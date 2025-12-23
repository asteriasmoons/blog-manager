import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "../config";
import { Buffer } from "buffer";

const { REPO_OWNER, REPO_NAME, POSTS_PATH } = CONFIG;

export const githubAPI = {
  async getPosts() {
    const token = await AsyncStorage.getItem("github_token");

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}`,
      {
        headers: { Authorization: `token ${token}` },
      }
    );

    return response.json();
  },

  async getPost(filename: string) {
    const token = await AsyncStorage.getItem("github_token");

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      {
        headers: { Authorization: `token ${token}` },
      }
    );

    const data = await response.json();

    // GitHub may include newlines in base64 content
    const base64 = (data.content || "").replace(/\n/g, "");

    // UTF-8 safe decode (fixes Iåm / donåt / etc.)
    return Buffer.from(base64, "base64").toString("utf8");
  },

  async savePost(
    filename: string,
    frontmatter: any,
    content: string,
    sha?: string
  ) {
    const token = await AsyncStorage.getItem("github_token");

    const mdxContent = `---
title: "${frontmatter.title}"
description: "${frontmatter.description}"
pubDate: "${frontmatter.pubDate || new Date().toISOString()}"
coverImage: "${frontmatter.coverImage}"
---

${content}`;

    const body: any = {
      message: sha
        ? `Update: ${frontmatter.title}`
        : `Add: ${frontmatter.title}`,
      // UTF-8 safe encode
      content: Buffer.from(mdxContent, "utf8").toString("base64"),
    };

    if (sha) body.sha = sha;

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    return response.json();
  },

  async deletePost(filename: string, sha: string) {
    const token = await AsyncStorage.getItem("github_token");

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Delete: ${filename}`,
          sha,
        }),
      }
    );

    return response.json();
  },
};
