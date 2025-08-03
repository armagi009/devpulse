# DevPulse

DevPulse is a developer analytics platform that helps teams monitor productivity, burnout risk, and team collaboration patterns.

## Features

- **Burnout Radar**: Monitor developer burnout risk factors
- **Productivity Metrics**: Track productivity trends and patterns
- **Team Collaboration**: Visualize team collaboration networks
- **Knowledge Distribution**: Identify knowledge silos and bus factor risks
- **Retrospectives**: Generate data-driven retrospectives
- **Mock Mode**: Develop and test without real GitHub credentials

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis server
- GitHub OAuth App credentials

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Configuration**

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file and update the following values:
- `GITHUB_ID` and `GITHUB_SECRET`: Your GitHub OAuth App credentials
- `DATABASE_URL`: Your PostgreSQL connection string
- `REDIS_URL`: Your Redis connection string
- `NEXTAUTH_SECRET`: A random string for NextAuth.js session encryption

4. **Database Setup**

Make sure your PostgreSQL server is running, then initialize the database:

```bash
node scripts/init-db.js
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Mode

```bash
npm run build
npm start
```

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the Homepage URL to `http://localhost:3000`
4. Set the Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
5. Copy the Client ID and Client Secret to your `.env` file

## Development with Mock Mode

DevPulse includes a mock mode that allows you to develop and test without real GitHub credentials or repositories.

### Enabling Mock Mode

1. Set the following environment variables in your `.env` file:

```bash
NEXT_PUBLIC_USE_MOCK_AUTH=true
NEXT_PUBLIC_USE_MOCK_API=true
```

2. Start the development server:

```bash
npm run dev
```

3. Sign in with a mock user and explore the application with mock data.

For more information about mock mode, see the [Mock Mode Documentation](./docs/mock-mode/README.md).

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running and accessible
- Check that the `DATABASE_URL` in your `.env` file is correct
- Run `npx prisma db push` to sync the schema with your database

### Schema Compatibility Issues

If you encounter database schema compatibility issues, run the schema compatibility check:

```bash
node scripts/ensure-schema-compatibility.js
```

This will check if your database schema is compatible with the code and provide guidance on any issues found.

For more information about the schema adapter, see the [Schema Adapter Documentation](./src/lib/db/README.md).

### Authentication Issues

- Verify your GitHub OAuth App credentials
- Ensure the callback URL matches exactly what's configured in GitHub
- Check that `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set correctly
- If using mock authentication, ensure `NEXT_PUBLIC_USE_MOCK_AUTH` is set to `true`

### Mock Mode Issues

- Ensure both `NEXT_PUBLIC_USE_MOCK_AUTH` and `NEXT_PUBLIC_USE_MOCK_API` are set to `true`
- Check the browser console for any errors
- Try resetting the mock data using the mock data management UI
- See the [Mock Mode Documentation](./docs/mock-mode/README.md) for more troubleshooting tips

## License

[MIT](LICENSE)