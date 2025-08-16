import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private readonly uploadsPath = join(process.cwd(), 'public', 'uploads');

  async saveFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
    mimetype: string
  ): Promise<{ url: string; size: number }> {
    try {
      // Generate unique filename
      const fileExtension = this.getFileExtension(originalName, mimetype);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      
      // Create folder path
      const folderPath = join(this.uploadsPath, folder);
      
      // Ensure folder exists
      await fs.mkdir(folderPath, { recursive: true });
      
      // Create full file path
      const filePath = join(folderPath, uniqueFilename);
      
      // Write file to disk
      await fs.writeFile(filePath, buffer);
      
      // Return relative URL and file size
      const url = `/uploads/${folder}/${uniqueFilename}`;
      const size = buffer.length;
      
      return { url, size };
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  private getFileExtension(originalName: string, mimetype: string): string {
    // Try to get extension from original filename
    if (originalName && originalName.includes('.')) {
      return originalName.substring(originalName.lastIndexOf('.'));
    }
    
    // Fallback to mimetype mapping
    const mimeToExtension = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    };
    
    return mimeToExtension[mimetype] || '.bin';
  }

  async deleteFile(relativePath: string): Promise<boolean> {
    try {
      // Remove leading slash if present
      const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
      const fullPath = join(process.cwd(), 'public', cleanPath);
      
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      // File doesn't exist or other error - log but don't throw
      console.warn(`Failed to delete file ${relativePath}:`, error.message);
      return false;
    }
  }

  async getFileSize(relativePath: string, folder: string, mimetype: string): Promise<number> {
    try {
      const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
      const fullPath = join(process.cwd(), 'public', cleanPath);
      const stats = await fs.stat(fullPath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }
}