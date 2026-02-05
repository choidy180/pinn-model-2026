import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true, // ✅ SSR/Minify/DisplayName 등을 SWC가 처리
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "1.254.24.170",
        port: "24828",
        pathname: "/images/**",
      },
    ],
  },
  turbopack: {},
  // Webpack 설정 함수에 정확한 타입을 지정합니다.
  webpack: (config, { isServer }) => {
    const fileLoaderRule = config.module.rules.find(
      (rule: any) => rule.test?.test?.('.svg'),
    );

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    if (fileLoaderRule && typeof fileLoaderRule !== 'string' && fileLoaderRule.exclude) {
      // RuleSetRule의 exclude 속성에 접근하여 SVG를 제외
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },
};

export default nextConfig;
