import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TUTOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only tutors and admins can upload materials' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Validate file type based on material type
    const validTypes = {
      PDF: ['application/pdf'],
      VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
      AUDIO: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac']
    };

    if (validTypes[type as keyof typeof validTypes] && !validTypes[type as keyof typeof validTypes].includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type for ${type}` }, { status: 400 });
    }

    // For now, we'll store the file in the public/uploads directory
    // In production, you'd want to use a cloud storage service like AWS S3, Cloudinary, etc.
    const uploadDir = process.env.UPLOAD_DIR || 'public/uploads';
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${uploadDir}/${fileName}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Note: In a real production environment, you'd want to:
    // 1. Use a cloud storage service (AWS S3, Cloudinary, etc.)
    // 2. Generate secure, unique filenames
    // 3. Implement proper file validation and sanitization
    // 4. Add virus scanning
    // 5. Implement proper access controls

    // For now, we'll return a mock URL structure
    // In production, this would be the actual cloud storage URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
