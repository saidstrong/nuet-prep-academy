# NUET Prep Academy

A comprehensive online learning platform designed specifically for NUET (National University Entrance Test) preparation. Built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

### 🎓 Core Learning Features
- **Interactive Course Content**: Video lessons, text materials, PDFs, and quizzes
- **Progress Tracking**: Real-time progress monitoring with achievements and streaks
- **Gamification**: Points, badges, and leaderboards to motivate learning
- **Multi-step Enrollment**: Tutor selection, payment options, and contact manager integration
- **Quiz System**: Interactive quizzes with multiple choice questions and explanations

### 👥 User Management
- **Role-based Access**: Students, Tutors, and Admins with different permissions
- **Authentication**: Secure sign-in/sign-up with password reset functionality
- **Profile Management**: Comprehensive user profiles with avatars and preferences
- **Session Management**: Secure session handling with automatic timeout

### 🎨 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Loading States**: Skeleton screens and loading indicators for better UX
- **Error Handling**: Comprehensive error boundaries and user-friendly messages
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### ⚡ Performance
- **Caching Strategy**: Intelligent caching for API responses and static content
- **Image Optimization**: Lazy loading and optimized images for faster loading
- **Code Splitting**: Dynamic imports and lazy loading for optimal bundle size
- **Performance Monitoring**: Real-time performance metrics and Web Vitals tracking

### 🔒 Security
- **Input Validation**: Comprehensive validation using Zod schemas
- **Rate Limiting**: Protection against abuse and spam
- **CSRF Protection**: Cross-site request forgery prevention
- **XSS Protection**: Input sanitization and output encoding
- **SQL Injection Protection**: Parameterized queries with Prisma ORM

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **NextAuth.js**: Authentication and session management

### Backend
- **Prisma**: Modern database ORM
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **REST API**: RESTful API endpoints
- **Row Level Security**: Database-level security policies

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Vercel**: Deployment and hosting

## 📁 Project Structure

```
nuet-prep-academy/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── student/           # Student dashboard
│   │   ├── tutor/             # Tutor dashboard
│   │   └── courses/           # Course pages
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   └── ...                # Feature-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Authentication configuration
│   │   ├── prisma.ts          # Database client
│   │   ├── cache.ts           # Caching utilities
│   │   ├── performance.ts     # Performance monitoring
│   │   └── validation.ts      # Input validation schemas
│   └── styles/                # Global styles
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── ...                        # Configuration files
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nuet-prep-academy.git
   cd nuet-prep-academy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   DATABASE_URL="your-database-url"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL_INTERNAL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Course Endpoints
- `GET /api/courses` - Get all courses
- `GET /api/courses/[id]` - Get course details
- `GET /api/courses/[id]/content` - Get course content
- `GET /api/courses/[id]/progress` - Get course progress
- `GET /api/courses/tutors` - Get available tutors

### Student Endpoints
- `POST /api/student/enroll` - Enroll in a course
- `GET /api/student/enrollments` - Get student enrollments
- `POST /api/student/progress` - Update progress

### Admin Endpoints
- `GET /api/admin/notifications` - Get admin notifications
- `PATCH /api/admin/notifications` - Update notification status
- `GET /api/admin/courses` - Manage courses
- `GET /api/admin/students` - Manage students

## 🧪 Testing

### Run the comprehensive test suite
```bash
node test-comprehensive.js
```

### Test individual components
```bash
npm run test
```

### Test API endpoints
```bash
npm run test:api
```

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual deployment
```bash
npm run build
npm run start
```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret key for JWT signing
- `NEXTAUTH_URL_INTERNAL`: Internal URL for server-side requests

### Database Configuration
The application uses Prisma ORM with PostgreSQL. The schema is defined in `prisma/schema.prisma`.

### Caching Configuration
The application uses an in-memory cache with configurable TTL values in `src/lib/cache.ts`.

## 📊 Performance Monitoring

The application includes comprehensive performance monitoring:
- **Web Vitals**: FCP, LCP, FID, CLS, TTFB
- **API Response Times**: Automatic measurement of all API calls
- **Component Performance**: Track component render times
- **Cache Statistics**: Monitor cache hit rates and size

## 🔒 Security Features

- **Input Validation**: All inputs validated using Zod schemas
- **Rate Limiting**: Protection against abuse
- **CSRF Protection**: Cross-site request forgery prevention
- **XSS Protection**: Input sanitization
- **SQL Injection Protection**: Parameterized queries
- **Authentication**: Secure session management
- **Authorization**: Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/nuet-prep-academy/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] User authentication and authorization
- [x] Course management system
- [x] Enrollment process
- [x] Progress tracking

### Phase 2: Enhanced Features ✅
- [x] Gamification system
- [x] Quiz and testing system
- [x] Performance optimization
- [x] Mobile responsiveness

### Phase 3: Advanced Features 🚧
- [ ] Real-time notifications
- [ ] Video streaming integration
- [ ] Advanced analytics
- [ ] Mobile app

### Phase 4: Enterprise Features 📋
- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] Integration APIs
- [ ] White-label options

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Supabase for backend services
- Prisma team for the excellent ORM
- All contributors and users

---

**Built with ❤️ for NUET students**