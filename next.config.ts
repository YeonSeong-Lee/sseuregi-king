// next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // @google-cloud/vision uses gRPC + dynamic protobuf loading that Turbopack
  // can't bundle correctly — leaves it as a runtime Node require.
  serverExternalPackages: ['@google-cloud/vision'],
};

export default withNextIntl(nextConfig);
