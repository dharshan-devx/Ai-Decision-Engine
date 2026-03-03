/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure broader browser compatibility
    reactStrictMode: true,

    // Transpile packages that might have compatibility issues
    transpilePackages: ['jspdf', 'lz-string'],

    // Ensure the app works even if some third-party scripts fail
    experimental: {
        // Optimize for production
        optimizePackageImports: ['jspdf', 'recharts', '@xyflow/react'],
    },
};

module.exports = nextConfig;
