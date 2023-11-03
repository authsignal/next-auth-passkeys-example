# Passkeys with Authsignal and NextAuth.js

This example shows how to integrate passkeys into a Next.js application using Authsignal + NextAuth.

## Overview

This demo uses NextAuth's built in email magic link provider for account creation and email magic link sign in. Once a user is logged in, they can create a passkey that can be used for signing in.

You will need to use your own email provider service to send magic links to users.

You will need to configure your Authsignal tenant to setup passkeys. Learn more here https://docs.authsignal.com/passkeys/getting-started.

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

2. **Environment Variables**

   Copy the `.env.example` file to a new file named `.env.local` and fill in your environment variables.

3. **Setup Prisma**

   - Add your database provider to the datasource object in schema.prisma. The default is `postgresql`.

   - Generate the Prisma Client:

     ```bash
     npx prisma generate
     ```

   - Run the Prisma migration to configure your database to use the schema:
   
     ```bash
     npx prisma migrate dev
     ```

4. **Start the application**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the application.
