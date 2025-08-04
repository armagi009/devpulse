# Build Information

## Build Command
`npm run vercel-build`

## Build Process
1. `prisma generate` - Generate Prisma client
2. `next build` - Build Next.js application

## Environment Variables Required
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- GITHUB_ID
- GITHUB_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ENCRYPTION_KEY

## Build Optimizations
- TypeScript errors ignored (`ignoreBuildErrors: true`)
- ESLint checks skipped (`ignoreDuringBuilds: true`)
- Type checking skipped (`SKIP_TYPE_CHECK=true`)
- Environment validation skipped (`SKIP_ENV_VALIDATION=1`)

## Last Updated
$(date)
