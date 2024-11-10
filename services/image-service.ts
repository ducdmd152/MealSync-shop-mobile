import CONSTANTS from "@/constants/data";
import { Alert } from "react-native";
import apiClient from "./api-services/api-client";
import sessionService from "./session-service";
import ValueResponse from "@/types/responses/ValueReponse";

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

export const uploadPreviewImage = async (uri: string) => {
  if (!uri) {
    Alert.alert("Oops", "Không có ảnh nào được chọn.");
    return;
  }

  const fetchImageResponse = await fetch(uri);
  const blob = await fetchImageResponse.blob();

  // Check if file size is within limit (5 MB in bytes)
  if (blob.size > CONSTANTS.FILE_CONSTRAINTS.MAX_FILE_SIZE_BYTE) {
    Alert.alert(
      "Oops",
      `Ảnh vượt quá dung lượng cho phép ${CONSTANTS.FILE_CONSTRAINTS.MAX_FILE_SIZE_MB} MB.`
    );
    return;
  }
  const fileName = `image-${Math.random() % 1_000_000}${
    Math.random() % 1_000_000
  }.${getExtensionFromMimeType(blob.type)}`;
  const formData = new FormData();
  formData.append("file", {
    uri: uri,
    name: fileName,
    type: blob.type,
  } as any);
  // Upload the image
  const result = await apiClient.put<ValueResponse<{ url: string }>>(
    "storage/file/upload",
    formData,
    {
      headers: {
        Authorization: `Bearer ${await sessionService.getAuthToken()}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return result.data.value?.url;
};

const imageService = {
  getExtensionFromMimeType,
  uploadPreviewImage,
};

export default imageService;
