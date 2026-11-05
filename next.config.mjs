import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['googleapis', 'resend', 'stripe', 'pg'],
  },
  async redirects() {
    return [
      {
        source: '/find-tutors',
        destination: '/find-instructors',
        permanent: false,
      },
      {
        source: '/become-a-tutor',
        destination: '/become-an-instructor',
        permanent: false,
      },
      {
        source: '/tutors/:id',
        destination: '/instructors/:id',
        permanent: false,
      },
      {
        source: '/admin/tutors',
        destination: '/admin/instructors',
        permanent: false,
      },
      {
        source: '/admin/tutor-applications',
        destination: '/admin/instructor-applications',
        permanent: false,
      },
      {
        source: '/student/tutors',
        destination: '/student/instructors',
        permanent: false,
      },
      {
        source: '/tutor/:path*',
        destination: '/instructor/:path*',
        permanent: false,
      },
    ];
  },
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    // Improve Windows dev file watching and prevent cache lock glitches
    if (dev) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
      };
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
