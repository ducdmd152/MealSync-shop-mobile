const mimeToExtension = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/gif": "gif",
  "application/pdf": "pdf",
} as { [key: string]: string };

export const getExtensionFromMimeType = (mimeType: string) => {
  return mimeToExtension[mimeType] || "unknown";
};
