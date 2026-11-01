const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'ISS-tracker';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGithubPages ? 'export' : undefined,
  basePath: isGithubPages ? `/${repoName}` : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? `/${repoName}` : '',
    NEXT_PUBLIC_DEEPSEEK_API_KEY:
      process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
      process.env.DEEPSEEK_API_KEY ||
      '',
    NEXT_PUBLIC_GEMINI_API_KEY:
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      '',
    NEXT_PUBLIC_ISS_API_ENDPOINT:
      process.env.NEXT_PUBLIC_ISS_API_ENDPOINT ||
      'https://api.wheretheiss.at/v1/satellites/25544',
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
