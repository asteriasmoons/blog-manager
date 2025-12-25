import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "../config";
import { Buffer } from "buffer";

const { REPO_OWNER, REPO_NAME, POSTS_PATH } = CONFIG;

function authHeaders(token: string) {
  console.log("🔵 Auth header token:", `${token.substring(0, 10)}...`);
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
  };
}

async function getTokenOrThrow() {
  const token = await AsyncStorage.getItem("github_token");
  console.log(
    "🔵 Token from storage:",
    token ? `${token.substring(0, 10)}...` : "NULL"
  );
  console.log("🔵 Token length:", token?.length);

  if (!token) throw new Error("No GitHub token found. Please log in again.");
  return token.trim();
}

export const githubAPI = {
  async getPosts() {
    const token = await getTokenOrThrow();

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}`,
      { headers: authHeaders(token) }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || `Could not load posts (HTTP ${response.status})`
      );
    }

    return data;
  },

  async getPost(filename: string) {
    const token = await getTokenOrThrow();

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      { headers: authHeaders(token) }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || `Could not load post (HTTP ${response.status})`
      );
    }

    const base64 = (data.content || "").replace(/\n/g, "");
    return Buffer.from(base64, "base64").toString("utf8");
  },

  async getPostMeta(filename: string) {
    const token = await getTokenOrThrow();

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      { headers: authHeaders(token) }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Could not load post metadata (HTTP ${response.status})`
      );
    }

    return { sha: data.sha as string };
  },

  async savePost(
    filename: string,
    frontmatter: any,
    content: string,
    sha?: string
  ) {
    const token = await getTokenOrThrow();

    // Format date as YYYY-MM-DD without quotes
    let pubDateFormatted = "";
    if (frontmatter?.pubDate) {
      const date = new Date(frontmatter.pubDate);
      pubDateFormatted = date.toISOString().split("T")[0];
    } else {
      pubDateFormatted = new Date().toISOString().split("T")[0];
    }

    console.log("🔵 pubDate input:", frontmatter?.pubDate);
    console.log("🔵 pubDate formatted:", pubDateFormatted);
    console.log("🔵 pubDate type:", typeof pubDateFormatted);

    // ---- TAGS (optional) ----
    let tagsLine = "";
    const rawTags = frontmatter?.tags;

    let tagsArr: string[] = [];
    if (Array.isArray(rawTags)) {
      tagsArr = rawTags;
    } else if (typeof rawTags === "string") {
      tagsArr = rawTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (tagsArr.length) {
      // Safest: JSON.stringify handles quotes/escaping correctly
      const safeTags = tagsArr.map((t) => JSON.stringify(String(t)));
      tagsLine = `tags: [${safeTags.join(", ")}]\n`;
    }
    // -------------------------

    const mdxContent = `---
title: "${frontmatter.title}"
description: "${frontmatter.description}"
${tagsLine}pubDate: ${pubDateFormatted}
coverImage: "${frontmatter.coverImage || ""}"
---

${content}`;

    console.log("🔵 Full MDX being saved:");
    console.log(mdxContent.substring(0, 300));

    const body: any = {
      message: sha ? `Update: ${frontmatter.title}` : `Add: ${frontmatter.title}`,
      content: Buffer.from(mdxContent, "utf8").toString("base64"),
    };

    if (sha) body.sha = sha;

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      {
        method: "PUT",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `Save failed (HTTP ${response.status})`);
    }

    return data;
  },

  async deletePost(filename: string, sha: string) {
    const token = await getTokenOrThrow();

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
      {
        method: "DELETE",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Delete: ${filename}`,
          sha,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || `Delete failed (HTTP ${response.status})`
      );
    }

    return data;
  },
};