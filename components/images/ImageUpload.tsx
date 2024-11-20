import CONSTANTS from "@/constants/data";
import imageService from "@/services/image-service";
import { useState } from "react";
import { Alert, View, ViewProps } from "react-native";
import CustomButton, { CustomButtonProps } from "../custom/CustomButton";
import PreviewImageUpload, {
  PreviewImageUploadProps,
} from "./PreviewImageUpload";
interface ImageUploadProps extends ViewProps {
  orignalURI: string;
  isImageUploading: boolean;
  setIsImageUploading: (value: boolean) => void;
  isAutoSave?: boolean;
  previewImageUploadProps: PreviewImageUploadProps;
  saveButtonProps: CustomButtonProps;
  cancelButtonProps: CustomButtonProps;
}
const ImageUpload = ({
  orignalURI,
  isAutoSave = false,
  previewImageUploadProps,
  saveButtonProps,
  cancelButtonProps,
  isImageUploading,
  setIsImageUploading,
  ...props
}: ImageUploadProps) => {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const handleUploadImage = async (uri: string) => {
    setIsImageUploading(true);
    try {
      const url =
        (await imageService.uploadPreviewImage(uri)) ||
        CONSTANTS.url.noImageAvailable;
      previewImageUploadProps.setUri(url);
    } catch (error: any) {
      Alert.alert("Oops!", "Xử lí hình ảnh lỗi, vui lòng thử lại!");
      if (isAutoSave) previewImageUploadProps.setUri(orignalURI);
    } finally {
      setIsImageUploading(false);
      setIsPreviewing(false);
    }
  };
  const saveMergeButtonProps = {
    ...saveButtonProps,
    title: saveButtonProps?.title || "Hủy",
    containerStyleClasses: `bg-white  border-[2px] boder-[#227B94] h-8 border-gray-300 ${saveButtonProps.containerStyleClasses}`,
    textStyleClasses: `text-sm text-[#227B94] ${saveButtonProps.textStyleClasses}`,
    handlePress: () => {
      handleUploadImage(previewImageUploadProps.uri);
    },
  };
  const cancelMergeButtonProps = {
    ...cancelButtonProps,
    title: cancelButtonProps?.title || "Hủy",
    containerStyleClasses: `bg-white border-[2px] border-[#227B94] h-8 border-gray-300 ${
      cancelButtonProps?.containerStyleClasses || ""
    }`,
    textStyleClasses: `text-sm text-[#227B94] ${
      cancelButtonProps?.textStyleClasses || ""
    }`,
    handlePress: () => {
      previewImageUploadProps.setUri(orignalURI);
    },
  };

  return (
    <View {...props}>
      <PreviewImageUpload
        {...previewImageUploadProps}
        afterPickImage={(uri) => {
          if (isAutoSave) handleUploadImage(uri);
          else setIsPreviewing(true);
        }}
      />
      {!isAutoSave && isPreviewing && (
        <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
          <CustomButton {...saveMergeButtonProps} />
          <CustomButton {...cancelMergeButtonProps} />
        </View>
      )}
    </View>
  );
};

export default ImageUpload;
