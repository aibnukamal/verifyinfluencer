# Verifyinfluencer

![Demovideo1-ezgif com-video-to-gif-converter (1)](https://github.com/user-attachments/assets/70529186-8d3e-42a0-90bd-a44ac6312e37)

Verifyinfluencer is website to Finds and Analyzes Content from health influencers with AI powered.

**The web capabilities include:**
- Identifying influencer claims through their Twitter account.
- Detecting health claims embedded in their content.
- Verifying these claims against trusted scientific journals using Gemini AI.

**Tech Stack**
- NX for monorepo
- NextJS + Ant Design
- NestJS
- Postgresql
- Gemini
- Typescript

**Screenshot**
<img width="1624" alt="Screenshot 2025-01-09 at 20 22 09" src="https://github.com/user-attachments/assets/5d7fe81a-6797-4300-be5a-42a64a62eecb" />
<img width="1624" alt="Screenshot 2025-01-09 at 20 22 19" src="https://github.com/user-attachments/assets/03eacbe7-37e7-4304-81af-6c70f832de44" />
<img width="1624" alt="Screenshot 2025-01-09 at 20 22 29" src="https://github.com/user-attachments/assets/48b96a54-4396-4ad5-a0f9-cde7c9a62fff" />

## Prerequisites

**Install Dependencies**

Ensure you have the following installed:
- NodeJS
- pnpm

**Clone repository**
```sh
git clone git@github.com:aibnukamal/verifyinfluencer.git  

cd verifyinfluencer  
```

**Install Packages**
```sh
pnpm install  
```

**Setup the API**

Navigate to the API folder and run Prisma migrations:

```sh
pnpm install
```
Select to API folder and run 
```sh
cd apps/api  

npx prisma migrate dev --name init  
```
Return to the root folder
```sh
 cd ../../
```
Run the database migration
```sh
 npx nx run api:migration-run
```

## Running the Services (Frontend and API)
Start the Frontend Development Server

```sh
npx nx run web:dev
```
- Access the Frontend app at: http://localhost:3000

Start the Backend Development Server

```sh
npx nx run api:serve
```
- Access the API at: http://localhost:3001
