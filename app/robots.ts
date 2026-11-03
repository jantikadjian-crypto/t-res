import type { MetadataRoute } from "next";

// A prototype with fictional data: keep it out of search results so it's never mistaken for a live
// tax service. Remove this when T-Res is real.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
