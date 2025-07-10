import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Res,
  NotFoundException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiBody, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "./cloudinary.service";
import { CloudinaryUploadResponseDto } from "./cloudinary-upload-response.dto";
import { Express, Response } from "express";
import { Readable } from "stream";
import * as multer from "multer";

@Controller("cloudinary")
@ApiTags("Cloudinary")
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    })
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File
  ): Promise<CloudinaryUploadResponseDto> {
    if (!file) {
      throw new HttpException("File is required", HttpStatus.BAD_REQUEST);
    }

    const { buffer, originalname, mimetype } = file;
    return this.cloudinaryService.uploadFile(buffer, originalname, mimetype);
  }

  @Get("pdf/:filename")
async getPdf(@Param("filename") filename: string, @Res() res: Response) {
  const fileUrl = `https://res.cloudinary.com/dg0jx3lqu/raw/upload/v1752087076/uploads/Dhrumil%20Trada%20Resume.pdf`;

  const response = await fetch(fileUrl);
  if (!response.ok) throw new NotFoundException("File not found");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  // Convert Web ReadableStream to Node.js Readable
  const reader = response.body!.getReader();
  const nodeStream = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    }
  });

  nodeStream.pipe(res);
}
}
