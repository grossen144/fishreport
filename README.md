# Fish Report

A mobile-first web application for tracking fishing catches and analyzing fishing patterns.

## Features

- User authentication with JWT
- Mobile-first responsive design
- Dynamic fishing report forms based on species
- Automatic weather data integration
- Location tracking
- Fishing statistics and insights
- Fishing buddy system

## Tech Stack

- Frontend: React with TypeScript, Material-UI
- Backend: Node.js with Express, TypeScript
- Database: PostgreSQL
- ORM: TypeORM
- Authentication: JWT
- Weather API: OpenWeatherMap

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- OpenWeatherMap API key

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd fishreport
```

2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Create a `.env` file in the backend directory:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=fishreport
JWT_SECRET=your_secret_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

4. Create the database:

```sql
CREATE DATABASE fishreport;
```

5. Start the development servers:

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:3003

## Deployment to Azure

1. Create an Azure account and install the Azure CLI

2. Create a PostgreSQL database in Azure:

```bash
az postgres flexible-server create \
  --resource-group your-resource-group \
  --name fishreport-db \
  --admin-user your-admin-user \
  --admin-password your-admin-password \
  --sku-name Standard_B1ms
```

3. Create an Azure App Service:

```bash
az appservice plan create \
  --name fishreport-plan \
  --resource-group your-resource-group \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group your-resource-group \
  --plan fishreport-plan \
  --name fishreport-app \
  --runtime "NODE:16-lts"
```

4. Configure environment variables in Azure Portal:

- Go to your App Service
- Navigate to Configuration > Application settings
- Add all the environment variables from your `.env` file

5. Deploy the application:

```bash
# Deploy backend
cd backend
az webapp up --name fishreport-app --resource-group your-resource-group

# Deploy frontend
cd ../frontend
npm run build
az storage blob upload-batch -s build -d $web --account-name your-storage-account
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
