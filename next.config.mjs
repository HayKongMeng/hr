/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{ hostname: "images.pexels.com" }],
    },
    turbo: {
        loaders: {
            '.svg': ['@svgr/webpack'],
        },
    },
};

export default nextConfig;