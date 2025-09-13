# 📊 Analytics Dashboard

A comprehensive analytics system for the NUET Prep Academy that provides administrators with detailed insights into student performance, course effectiveness, and financial metrics.

## 🚀 Features

### 📈 Key Metrics Dashboard
- **Total Students**: Count of all enrolled students
- **Total Tutors**: Count of all active tutors
- **Total Courses**: Count of all available courses
- **Total Revenue**: Sum of all completed payments

### 📊 Interactive Charts
- **Monthly Enrollments**: Bar chart showing enrollment trends over time
- **Revenue Trends**: Area chart displaying revenue patterns
- **Course Performance**: Bar chart comparing course enrollments and completion rates
- **Test Results Distribution**: Pie chart showing score distribution (Excellent, Good, Average, Poor, Failed)

### 📋 Detailed Tables
- **Top Performing Courses**: Table ranking courses by enrollments, completion rates, average scores, and revenue
- **Student Progress Metrics**: Weekly tracking of active students and study time

### ⏰ Time Range Selection
- **7 Days**: Last week data
- **30 Days**: Last month data (default)
- **90 Days**: Last quarter data
- **1 Year**: Last year data

## 🏗️ Architecture

### Frontend Components
- **`AnalyticsDashboard.tsx`**: Main dashboard component with charts and metrics
- **`/admin/analytics/page.tsx`**: Admin analytics page with authentication

### Backend API
- **`/api/admin/analytics`**: RESTful endpoint providing all analytics data
- **Role-based Access Control**: Only ADMIN and OWNER roles can access

### Data Sources
- **User Management**: Student and tutor counts
- **Course Data**: Enrollment statistics and performance metrics
- **Payment System**: Revenue tracking and financial analytics
- **Test Results**: Score distribution and completion rates
- **Material Progress**: Study time tracking and engagement metrics

## 🔧 Setup Instructions

### 1. Prerequisites
Ensure you have the following models in your Prisma schema:
- `User` (with role field)
- `Course`
- `CourseEnrollment`
- `Payment`
- `TestSubmission`
- `MaterialProgress`
- `Topic`
- `Test`

### 2. Install Dependencies
The dashboard uses `recharts` for data visualization:
```bash
npm install recharts
```

### 3. Environment Variables
No additional environment variables required beyond your existing setup.

### 4. Database Access
The analytics system requires read access to all major database tables. Ensure your database connection is properly configured.

## 📱 Usage

### Accessing Analytics
1. **Login as Admin/Owner**: Navigate to `/admin/analytics`
2. **View Dashboard**: See key metrics and charts
3. **Select Time Range**: Choose from 7d, 30d, 90d, or 1y
4. **Analyze Data**: Review performance metrics and trends

### Interpreting Metrics

#### Student Metrics
- **Total Students**: Overall academy size
- **Active Students**: Students engaged in the last time period
- **Study Time**: Average hours spent per week

#### Course Performance
- **Enrollment Count**: Popularity indicator
- **Completion Rate**: Effectiveness measure
- **Average Score**: Quality indicator

#### Financial Metrics
- **Total Revenue**: Overall financial performance
- **Revenue Trends**: Growth patterns over time
- **Course Revenue**: Individual course profitability

## 🎯 Key Insights

### Student Engagement
- Track weekly active student counts
- Monitor study time patterns
- Identify engagement trends

### Course Effectiveness
- Compare enrollment vs. completion rates
- Analyze test performance by course
- Identify high-performing courses

### Financial Performance
- Monitor revenue growth
- Track payment completion rates
- Analyze course profitability

## 🔒 Security Features

### Authentication
- Session-based authentication required
- Role-based access control (ADMIN/OWNER only)

### Data Privacy
- No personal student information exposed
- Aggregated statistics only
- Secure API endpoints

## 🚀 Performance Optimizations

### Database Queries
- Efficient Prisma queries with proper includes
- Date range filtering for performance
- Aggregated calculations at database level

### Frontend Optimization
- Responsive chart rendering
- Efficient state management
- Lazy loading of chart components

## 🛠️ Customization

### Adding New Metrics
1. **Extend API**: Add new data calculations in `/api/admin/analytics`
2. **Update Interface**: Modify `AnalyticsData` interface
3. **Add Charts**: Create new chart components
4. **Update Dashboard**: Integrate new metrics into the main view

### Chart Customization
- Modify colors using `COLORS` array
- Adjust chart dimensions and responsiveness
- Customize tooltips and legends

### Time Range Extensions
- Add new time periods in the API
- Update frontend time range selector
- Extend date calculation logic

## 📊 Data Accuracy

### Real-time Updates
- Data refreshes on time range change
- Accurate to the last database transaction
- No caching delays

### Data Validation
- Null-safe calculations
- Proper error handling
- Fallback values for missing data

## 🔍 Troubleshooting

### Common Issues

#### No Data Displayed
- Check database connection
- Verify user has ADMIN/OWNER role
- Check browser console for errors

#### Charts Not Rendering
- Ensure `recharts` is installed
- Check for JavaScript errors
- Verify data structure matches expected format

#### Performance Issues
- Check database query performance
- Verify proper indexing on date fields
- Monitor API response times

### Debug Mode
Enable console logging in the API route for detailed debugging:
```typescript
console.log('Analytics data:', analyticsData);
```

## 🚀 Future Enhancements

### Planned Features
- **Export Functionality**: PDF/Excel reports
- **Real-time Updates**: WebSocket integration
- **Advanced Filtering**: Course, tutor, date range filters
- **Custom Dashboards**: User-configurable layouts
- **Email Reports**: Scheduled analytics summaries

### Integration Opportunities
- **Google Analytics**: External traffic data
- **Payment Gateways**: Enhanced financial metrics
- **Learning Management**: Advanced progress tracking
- **Communication Tools**: Engagement analytics

## 📚 API Reference

### GET `/api/admin/analytics`
Returns comprehensive analytics data for the specified time range.

#### Query Parameters
- `range`: Time range (7d, 30d, 90d, 1y)

#### Response Format
```typescript
{
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyEnrollments: Array<{month: string, enrollments: number}>;
  coursePerformance: Array<{course: string, enrollments: number, completionRate: number}>;
  studentProgress: Array<{week: string, activeStudents: number, avgStudyTime: number}>;
  revenueTrends: Array<{month: string, revenue: number}>;
  testResults: Array<{name: string, value: number}>;
  topCourses: Array<{
    id: string;
    title: string;
    tutor: string;
    enrollments: number;
    completionRate: number;
    averageScore: number;
    revenue: number;
  }>;
}
```

## 🤝 Contributing

### Development Guidelines
1. **Follow TypeScript**: Maintain type safety
2. **Test API Endpoints**: Verify data accuracy
3. **Responsive Design**: Ensure mobile compatibility
4. **Performance**: Optimize database queries
5. **Security**: Validate user permissions

### Code Structure
- **Components**: Reusable chart components
- **API Routes**: RESTful endpoints
- **Types**: Shared TypeScript interfaces
- **Utils**: Helper functions for data processing

---

**Built with ❤️ for NUET Prep Academy**
