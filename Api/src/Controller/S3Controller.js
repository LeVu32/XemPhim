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
    accessKeyId: "23ff7337a2c7aeccf630cc8cc97cba8c",
    secretAccessKey:
      "abe51fa27d3d57464d58c3ae357cf7ad8ee8dcb2c9c0606016d83000a06a1433",
  },
  region: "auto",
});

// const getFileName = (file) => {
//   const tempFilename = Date.now().toString();
//   const hashedFileName = crypto
//     .createHash("md5")
//     .update(tempFilename)
//     .digest("hex");
//   const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
//   const filename = `${hashedFileName}${ext}`;
//   return filename;
// };

export const urlPreSign = async (Key) => {
  return await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: Key,
    }),
    {
      expiresIn: 60 * 60 * 24 * 7, // 7d
    },
  );
};

export const getObjectSignedUrl = async (Key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key,
  });
  const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 }); // URL hết hạn sau 1 giờ
  return signedUrl;
};

export const uploadStream = async (file) => {
  const tempFilename = Date.now().toString();
  const hashedFileName = crypto
    .createHash("md5")
    .update(tempFilename)
    .digest("hex");
  const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
  const filename = `${hashedFileName}${ext}`;
  console.log(process.env.BUCKET_NAME);

  const createMultipartUploadCommand = new CreateMultipartUploadCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
    ContentType: "video/mp4",
  });
  const createMultipartUploadResponse = await S3.send(
    createMultipartUploadCommand,
  );
  const uploadId = createMultipartUploadResponse.UploadId;

  const parts = [];
  let partNumber = 1;
  const partSize = 5 * 1024 * 1024;

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

  return res;
};

export const getObject = async (Bucket, Key) => {
  return new Promise(async (resolve, reject) => {
    const getObjectCommand = new GetObjectCommand({ Bucket, Key });

    try {
      const response = await S3.send(getObjectCommand);

      // Store all of data chunks returned from the response data stream
      // into an array then use Array#join() to use the returned contents as a String
      let responseDataChunks = [];

      // Handle an error while streaming the response body
      response.Body.once("error", (err) => reject(err));

      // Attach a 'data' listener to add the chunks of data to our array
      // Each chunk is a Buffer instance
      response.Body.on("data", (chunk) => responseDataChunks.push(chunk));

      // Once the stream has no more data, join the chunks into a string and return the string
      response.Body.once("end", () => resolve(responseDataChunks.join("")));
    } catch (err) {
      // Handle the error or throw
      return reject(err);
    }
  });
};
