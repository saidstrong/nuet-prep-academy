# Content Management System

The NUET Prep Academy Content Management System provides comprehensive tools for tutors to create, organize, and manage course materials, while giving students an intuitive interface to access and track their learning progress.

## 🚀 Features

### For Tutors
- **Material Creation**: Upload PDFs, videos, audio files, external links, and text content
- **Content Organization**: Organize materials by topics with custom ordering
- **Publishing Control**: Draft/publish materials to control student access
- **File Management**: Support for multiple file types with size validation
- **Content Editing**: Edit existing materials and update content
- **Material Reordering**: Drag-and-drop style reordering within topics

### For Students
- **Content Discovery**: Browse materials organized by topics and courses
- **Progress Tracking**: Track completion status and time spent on materials
- **Multiple Formats**: View PDFs, play videos/audio, visit external links
- **Download Options**: Download materials for offline study
- **Progress Visualization**: Clear indicators for completed, in-progress, and not-started materials

## 📁 File Structure

```
src/
├── app/
│   ├── tutor/
│   │   └── content-management/
│   │       └── page.tsx          # Tutor content management interface
│   ├── student/
│   │   └── content-viewer/
│   │       └── page.tsx          # Student content viewing interface
│   └── api/
│       ├── materials/
│       │   ├── route.ts          # CRUD operations for materials
│       │   └── upload/
│       │       └── route.ts      # File upload handling
│       └── materials/
│           └── progress/
│               └── route.ts      # Student progress tracking
├── components/
│   └── MaterialCreationModal.tsx # Material creation/editing modal
public/
└── uploads/                      # File storage directory
```

## 🗄️ Database Schema

### Material Model
```prisma
model Material {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        MaterialType
  url         String?
  content     String?
  order       Int
  fileSize    Int?     // File size in bytes
  fileName    String?  // Original filename
  mimeType    String?  // File MIME type
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  topicId String
  topic   Topic  @relation(fields: [topicId], references: [id])
  progress MaterialProgress[]
}
```

### MaterialProgress Model
```prisma
model MaterialProgress {
  id        String   @id @default(cuid())
  status    String   @default("NOT_STARTED") // 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'
  timeSpent Int      @default(0) // Time spent in seconds
  lastAccessed DateTime @default(now())
  completedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  materialId String
  material   Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  
  studentId String
  student   User   @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([materialId, studentId])
}
```

## 🔧 Setup Instructions

### 1. Database Migration
Run the following command to apply the new schema changes:
```bash
npx prisma migrate dev --name add-content-management
```

### 2. Create Uploads Directory
Ensure the uploads directory exists:
```bash
mkdir -p public/uploads
```

### 3. Environment Variables
Add the following to your `.env` file:
```bash
# File Upload Configuration
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=52428800  # 50MB in bytes
```

## 📱 Usage

### Tutor Workflow
1. **Access Content Management**: Navigate to `/tutor/content-management`
2. **Select Topic**: Choose a topic to add materials to
3. **Create Material**: Click "Add Material" and fill out the form
4. **Upload Files**: Select files (PDF, video, audio) or enter content
5. **Publish**: Set materials as published to make them visible to students
6. **Organize**: Use the reorder buttons to arrange materials logically

### Student Workflow
1. **Access Course Content**: Navigate to `/student/content-viewer`
2. **Select Course**: Choose from enrolled courses
3. **Browse Topics**: Expand topics to see available materials
4. **View Materials**: Click on materials to view/download content
5. **Track Progress**: Mark materials as complete to track learning progress

## 🎯 Supported File Types

### PDF Documents
- **Extensions**: `.pdf`
- **Max Size**: 50MB
- **Features**: View in browser, download

### Video Files
- **Extensions**: `.mp4`, `.avi`, `.mov`, `.wmv`
- **Max Size**: 50MB
- **Features**: Play in browser, download

### Audio Files
- **Extensions**: `.mp3`, `.wav`, `.m4a`, `.aac`
- **Max Size**: 50MB
- **Features**: Play in browser, download

### External Links
- **Format**: Any valid URL
- **Features**: Direct link to external resources

### Text Content
- **Format**: Rich text/HTML
- **Features**: Formatted display with HTML support

## 🔒 Security Features

- **Role-based Access**: Only tutors and admins can create/edit materials
- **File Validation**: File type and size validation on upload
- **Enrollment Check**: Students can only access materials from enrolled courses
- **Published Control**: Only published materials are visible to students

## 🚀 Future Enhancements

### Planned Features
- **Cloud Storage Integration**: AWS S3, Google Cloud Storage support
- **Video Streaming**: Integrated video player with progress tracking
- **Interactive Content**: Quizzes, assignments within materials
- **Collaborative Editing**: Multiple tutors can edit materials
- **Version Control**: Track changes and revert to previous versions
- **Analytics Dashboard**: Detailed progress analytics for tutors

### Technical Improvements
- **CDN Integration**: Faster file delivery worldwide
- **File Compression**: Automatic optimization of uploaded files
- **Batch Operations**: Bulk upload and management features
- **Search & Filter**: Advanced content discovery tools

## 🐛 Troubleshooting

### Common Issues

#### File Upload Fails
- Check file size (must be under 50MB)
- Verify file type is supported
- Ensure uploads directory has write permissions

#### Materials Not Visible to Students
- Check if material is marked as published
- Verify student enrollment in the course
- Check topic and course visibility settings

#### Progress Not Updating
- Ensure student is logged in
- Check database connection
- Verify API endpoint accessibility

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Check server logs for backend errors
4. Validate database schema and relationships

## 📞 Support

For technical support or feature requests related to the Content Management System, please contact the development team or create an issue in the project repository.

---

**Note**: This system is designed to be scalable and can be extended with additional features as needed. The current implementation provides a solid foundation for content management in educational environments.
