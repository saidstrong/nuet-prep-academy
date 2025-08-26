# NUET Prep Academy - Learning Platform

A comprehensive learning management system for NUET (Nazarbayev University Entrance Test) preparation, built with Next.js, Tailwind CSS, and Prisma.

## Features

### 🔐 Authentication & User Management
- **NextAuth.js** integration with credentials provider
- **Role-based access control**: Owner, Tutor, Student
- **Secure password hashing** with bcryptjs
- **Protected routes** and API endpoints

### 👥 User Roles
- **Owner**: Full system access, can add tutors, manage courses
- **Tutor**: Can teach students, manage profile, view assigned students
- **Student**: Can register, enroll in courses, view materials

### 📚 Course Management
- **Course catalog** with detailed information
- **Enrollment system** with tutor assignment
- **Student dashboard** showing enrolled courses
- **Tutor capacity management** (max 30 students per tutor)

### 🎯 Profile System
- **Comprehensive user profiles** with editable fields
- **Profile photos** and personal information
- **Role-specific profile views**

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nuet_prep_academy"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Formspree (for contact form)
FORMSPREE_FORM_ID="your-formspree-form-id"

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Default Accounts

After running the seed script, you'll have:

- **Owner Account**:
  - Email: `owner@nuetprep.academy`
  - Password: `owner123`
  - Role: `OWNER`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (via NextAuth)

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Courses
- `GET /api/my-courses` - Get enrolled courses for current user

### Admin
- `POST /api/admin/add-tutor` - Add new tutor (Owner only)

## Database Schema

### Users
- Basic info (name, email, password)
- Role (STUDENT, TUTOR, OWNER)
- Timestamps

### Profiles
- Extended user information
- Bio, phone, avatar, address
- Education and experience

### Courses
- Course details (title, description, price, duration)
- Creator reference
- Status management

### Course Enrollments
- Student-tutor-course relationships
- Enrollment status tracking
- Timestamps

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="your-production-postgresql-url"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
FORMSPREE_FORM_ID="your-formspree-id"
NEXT_PUBLIC_GA_ID="your-ga-id"
```

## Security Features

- **Password hashing** with bcryptjs
- **JWT-based sessions** with NextAuth
- **Role-based access control**
- **Input validation** with Zod
- **Protected API routes**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary to NUET Prep Academy.

## Support

For technical support or questions, contact the development team.
