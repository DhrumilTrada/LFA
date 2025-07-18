import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject("CLOUDINARY") private readonly cloudinaryInstance: typeof cloudinary
  ) {}

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<{ url: string; size: number }> {
    return new Promise((resolve, reject) => {
      // Determine correct resource type
      const isImage = mimetype.startsWith("image/");
      const resourceType = isImage ? "image" : "raw";

      const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "uploads",
          public_id: filename, // Keep the full filename with extension
          use_filename: true, // Let Cloudinary keep the original filename
          unique_filename: false, // Don't auto-generate names
        },
        (error: any, result: UploadApiResponse) => {
          if (error) {
            return reject(
              new BadRequestException(
                "Cloudinary upload failed: " + error.message
              )
            );
          }
          resolve({ url: result.secure_url, size: result.bytes });
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
