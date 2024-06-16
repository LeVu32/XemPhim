import {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectAclCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import stream from "stream";

const S3 = new S3Client({
  endpoint: "https://1d4d0d7a6471d2c6bd3d5a7c3ca7cb82.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "cc9a4a2901e31c2c47bd52fe52b43450",
    secretAccessKey:
      "5664712910402a5ee13081092ed9a452983b6e0ed81f98e9a50169bf0d4a0eff",
    // sessionToken: "MgPy7vb_CTNNA-VCZxADikdaoDhtcA69y4b_yEcP",
  },
  region: "auto",
});

export const urlPreSign = async (Key) => {
  return await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: Key,
    }),
    {
      expiresIn: 60 * 60 * 24 * 7, // 7d
    }
  );
};

export const getObjectSignedUrl = async (Key) => {
  //key ~ tên file
  // lấy link video dựa theo quyền -> có thể xem
  const command = new GetObjectCommand({
    // tạo ra lệnh
    Bucket: process.env.BUCKET_NAME, // tên bucket ~ tên thư mục
    Key,
  });
  const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 }); // URL hết hạn sau 1 giờ
  return signedUrl;
};

export const uploadStream = async (file, type) => {
  const tempFilename = Date.now().toString();
  const hashedFileName = crypto
    .createHash("md5")
    .update(tempFilename)
    .digest("hex");
  const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
  const filename = `${hashedFileName}${ext}`;
  const createMultipartUploadCommand = new CreateMultipartUploadCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
    ContentType: type,
  });
  const createMultipartUploadResponse = await S3.send(
    createMultipartUploadCommand
  );
  const uploadId = createMultipartUploadResponse.UploadId;

  const parts = [];
  let partNumber = 1;

  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  for await (const chunk of bufferStream) {
    const uploadPartCommand = new UploadPartCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
      PartNumber: partNumber,
      UploadId: uploadId,
      Body: chunk,
    });
    const uploadPartResponse = await S3.send(uploadPartCommand);

    parts.push({
      ETag: uploadPartResponse.ETag,
      PartNumber: partNumber,
    });
    partNumber++;
  }

  const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts,
    },
  });
  const res = await S3.send(completeMultipartUploadCommand);
  console.log("kết quả upload:", res);
  return res;
};

export const getObject = async (Bucket, Key) => {
  return new Promise(async (resolve, reject) => {
    const getObjectCommand = new GetObjectCommand({ Bucket, Key });

    try {
      const response = await S3.send(getObjectCommand);

      let responseDataChunks = [];

      response.Body.once("error", (err) => reject(err));

      response.Body.on("data", (chunk) => responseDataChunks.push(chunk));

      response.Body.once("end", () => resolve(responseDataChunks.join("")));
    } catch (err) {
      return reject(err);
    }
  });
};

export const generateUploadPresignedUrl = async (bucketName, key) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: "video/mp4",
  });

  const signedUrl = await getSignedUrl(S3, command, {
    expiresIn: 60 * 60 * 24 * 1, // 1 day
  });

  return signedUrl;
};
