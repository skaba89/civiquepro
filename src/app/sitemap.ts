import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const now = new Date();

  // Public pages only — protected pages are not indexed
  const publicPages = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/ressources", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/register", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return publicPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
