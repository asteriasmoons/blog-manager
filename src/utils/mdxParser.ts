export const parseMDX = (content: string) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: "" };

  const frontmatterText = match[1];
  const bodyContent = match[2];

  const frontmatter: any = {};
  frontmatterText.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts
        .join(":")
        .trim()
        .replace(/^"|"$/g, "");
    }
  });

  return { frontmatter, content: bodyContent.trim() };
};
