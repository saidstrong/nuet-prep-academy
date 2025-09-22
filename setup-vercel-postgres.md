# Setting up Vercel Postgres Database

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard: https://vercel.com/saids-projects-c6c9220f/nuet-prep-academy
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Name it "nuet-prep-academy-db"
6. Click "Create"

## Step 2: Get Database URL

1. After creating the database, click on it
2. Go to the "Settings" tab
3. Copy the "Connection String" (it will look like: `postgres://...`)
4. This is your `DATABASE_URL`

## Step 3: Add Environment Variable

1. Go to your project settings in Vercel
2. Click on "Environment Variables"
3. Add a new variable:
   - Name: `DATABASE_URL`
   - Value: [paste the connection string from step 2]
   - Environment: Production, Preview, Development
4. Click "Save"

## Step 4: Deploy and Run Migrations

After setting up the environment variable, the next deployment will automatically:
1. Run Prisma migrations
2. Create all database tables
3. Seed the database with initial data

## Step 5: Test the Chat System

Once deployed, the chat system should work properly with persistent messages!
