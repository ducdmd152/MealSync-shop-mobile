import { Colors } from "@/constants/Colors";
import useGlobalChattingState from "@/hooks/states/useChattingState";
import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import useGlobalSocketState from "@/hooks/states/useGlobalSocketState";
import apiClient from "@/services/api-services/api-client";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, Camera, Play, Send, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Bubble,
  Composer,
  GiftedChat,
  InputToolbar,
  Send as SendMess,
} from "react-native-gifted-chat";
import { Avatar, IconButton, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PREVIEW_HEIGHT = 150;
interface Media {
  uri: string;
  type: string;
  preview?: boolean;
}

interface ChatMessage {
  id: string;
  message: string;
  file_url?: string;
  account_id: string;
  created_at: string;
}

interface ChatData {
  [key: string]: {
    id: string;
    fullName: string;
    avatarUrl: string;
    roleId: number;
  };
}
interface Channel {
  id: string;
  last_message: string;
  last_update_id: string;
  updated_at: string;
  is_close: number;
  map_user_is_read: {
    [key: string]: boolean;
  };
}
const MediaPreview = ({
  media,
  onRemove,
}: {
  media: Media | null;
  onRemove: () => void;
}) => {
  const videoRef = useRef<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  if (!media) return null;

  if (media.type === "image") {
    return (
      <View style={styles.mediaPreviewItem}>
        <Image
          source={{ uri: media.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />

        <IconButton
          icon={() => <X size={20} color="white" />}
          onPress={onRemove}
          style={styles.removeButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.mediaPreviewItem}>
      <Video
        ref={videoRef}
        source={{ uri: media.uri }}
        style={styles.previewVideo}
        resizeMode={ResizeMode.COVER}
        isLooping
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
          }
        }}
      />
      <Pressable
        style={[styles.playButton, isPlaying && styles.playButtonHidden]}
        onPress={togglePlayback}
      >
        <Play size={30} color="white" />
      </Pressable>
      <IconButton
        icon={() => <X size={20} color="white" />}
        onPress={onRemove}
        style={styles.removeButton}
      />
    </View>
  );
};

const CustomInputToolbar = ({
  selectedMedia,
  onRemoveMedia,
  isClose,
  ...props
}: {
  isClose: boolean;
  selectedMedia: Media | null;
  onRemoveMedia: () => void;
}) => {
  if (isClose)
    return (
      <View className="h-20 justify-center items-center">
        <Text className="text-gray-600">
          Đã quá thời gian nhắn tin cho đơn này.
        </Text>
      </View>
    );
  return (
    <View style={styles.inputContainer} className="">
      {selectedMedia && (
        <View style={styles.mediaPreviewContainer}>
          <MediaPreview media={selectedMedia} onRemove={onRemoveMedia} />
        </View>
      )}
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: "white",
          alignContent: "center",
          justifyContent: "center",
          padding: 6,
          height: 50,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: Colors.primaryBackgroundColor,
          marginHorizontal: 15,
          marginBottom: 4,
          ...styles.shadow,
        }}
      />
    </View>
  );
};

const MessageVideo = ({ currentMessage }: { currentMessage: any }) => {
  const videoRef = useRef<Video | null>(null);
  const [status, setStatus] = useState<any>({});

  return (
    <>
      <View style={styles.messageVideoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: currentMessage.video }}
          style={styles.messageVideo}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        />
        {!status.isPlaying && (
          <Pressable
            style={styles.messagePlayButton}
            onPress={() => videoRef.current?.playAsync()}
          >
            <Play size={30} color="white" />
          </Pressable>
        )}
      </View>
    </>
  );
};

const Chatbox = ({ onBack = () => {} }: { onBack?: () => void }) => {
  const globalChattingState = useGlobalChattingState();
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const globalAuthState = useGlobalAuthState();
  const userInfo = globalAuthState?.authDTO;
  const { socket } = useGlobalSocketState();
  const [channelData, setChannelData] = useState<Channel>();

  const authId = globalAuthState.authDTO?.id || 0;
  const pickMedia = async () => {
    try {
      if (Platform.OS !== "web") {
        const libraryStatus =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus.status !== "granted") {
          Alert.alert(
            "Oops",
            "Ứng dụng cần truy cập thư viện để hoàn tất tác vụ!"
          );
        }

        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== "granted") {
          Alert.alert(
            "Oops",
            "Ứng dụng cần truy cập camera để hoàn tất tác vụ!"
          );
          return;
        }
      }

      console.log("Picking media");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.5,
        videoMaxDuration: 60,
        aspect: [1, 1],
      });
      console.log(result);
      if (!result.canceled) {
        const asset = result.assets[0];
        console.log(result, "result");
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        if (!fileInfo.exists) {
          Alert.alert("Error", "Không tìm thấy file!!!");
          return;
        }
        if (fileInfo.size / (1024 * 1024) > 5) {
          Alert.alert("Error", "File size exceeds 5MB.");
          console.log("File");
          return;
        }
        const mediaUrl = await uploadMedia(asset.uri, asset.type);
        if (mediaUrl) {
          setSelectedMedia({
            uri: asset.uri,
            type:
              asset.type || (asset.uri.endsWith(".mp4") ? "video" : "image"),
            preview: true,
          });
          console.log(mediaUrl, "uploadMedia");
          setSelectedMediaUrl(mediaUrl);
        }
      }
    } catch (error) {
      console.log(error, " error pick media in chat");
      Alert.alert("Error", "Failed to pick media");
    }
  };

  const uploadMedia = async (uri: string, fileType: any) => {
    try {
      const formData = new FormData();

      // Create a Blob (or File) instance using the uri and the necessary details
      formData.append("file", {
        uri,
        name: `media-${Date.now()}.${fileType === "video" ? "mp4" : "jpg"}`,
        type: fileType === "video" ? "video/mp4" : "image/jpeg",
      } as any); // This is used to bypass the type mismatch temporarily

      // Alternatively, using File constructor for better type safety (if running in a browser environment or similar)

      const res = await apiClient.put(`storage/file/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // This ensures the entire request is recognized as multipart/form-data
        },
      });

      const data = await res.data;
      if (data.isSuccess) {
        return data?.value?.url;
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleGetChatData = async () => {
    try {
      const res = await apiClient.get(
        `order/${globalChattingState.channelId}/chat-info`
      );
      const data = await res.data;
      if (data.isSuccess) {
        setChatData(data.value);
      }
    } catch (error) {
      console.error(error, " error", globalChattingState.channelId);
    }
  };

  useEffect(() => {
    handleGetChatData();
    return () => {
      if (socket) {
        socket.emit("leaveRoomsChat", {
          chatRoomId: globalChattingState.channelId,
        });
      }
    };
  }, []);

  const [dataHeader, setDataHeader] = useState<any | null>(null);
  console.log("globalChattingState.channelId: ", globalChattingState.channelId);

  useEffect(() => {
    console.log(socket, " socket ne ", chatData);
    if (chatData) {
      try {
        if (socket) {
          Object.keys(chatData).forEach((key) => {
            if (chatData[key].roleId === 1) {
              setDataHeader(chatData[key]);
            }
          });
          socket.emit("joinRoomsChat", {
            chatRoomId: globalChattingState.channelId,
            chatData,
          });
          socket.on("errorChat", (msg) => {
            if (msg) {
              console.log(msg, " Error chat message");
            }
          });
          socket.on("chatMessage", (msg: any) => {
            console.log(msg, "chatMessage");
            let user: any = {};
            if (chatData[msg.account_id]) {
              user = {
                _id: chatData[msg.account_id].id,
                name: chatData[msg.account_id].fullName,
                avatar: chatData[msg.account_id].avatarUrl,
              };
            } else {
              user = {
                _id: msg.id,
                name: "",
                avatar: "",
              };
            }
            console.log(user, " user for chatg");
            if (user._id === userInfo?.id) return;
            let imageUrl = null;
            let videoUrl = null;
            if (msg.file_url) {
              if (msg.file_url.includes("video")) {
                videoUrl = msg.file_url;
              } else {
                imageUrl = msg.file_url;
              }
            }
            setMessages((previousMessages) =>
              GiftedChat.append(previousMessages, [
                {
                  _id: msg.id,
                  text: msg.message,
                  image: imageUrl,
                  video: videoUrl,
                  user,
                  createdAt: new Date(msg.created_at),
                },
              ])
            );
          });
          socket.on("previousMessages", (previousMessages: any) => {
            setMessages(
              previousMessages.map((msg: any) => {
                let user: any = {};

                if (chatData[msg.account_id]) {
                  user = {
                    _id: chatData[msg.account_id].id,
                    name: chatData[msg.account_id].fullName,
                    avatar: chatData[msg.account_id].avatarUrl,
                  };
                } else {
                  user = {
                    _id: msg.id,
                    name: "",
                    avatar: "",
                  };
                }
                let imageUrl = null;
                let videoUrl = null;
                if (msg.file_url) {
                  if (msg.file_url.includes("video")) {
                    videoUrl = msg.file_url;
                  } else {
                    imageUrl = msg.file_url;
                  }
                }
                return {
                  _id: msg.id,
                  text: msg.message,
                  image: imageUrl,
                  video: videoUrl,
                  user,
                  createdAt: new Date(msg.created_at),
                };
              })
            );
          });
          socket.on("receivedRoomData", (msg) => {
            console.log(msg, "receivedRoomData neeeeeeeee");
            setChannelData(msg);
          });
          socket.emit("getRoomDataById", globalChattingState.channelId);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    }
  }, [chatData]);

  const onSend = async (newMessages: any = []) => {
    try {
      if (!socket || channelData?.is_close == 2) return;

      const [message] = newMessages;
      console.log(message, " new messages");
      const messageToSend = {
        text: message.text,
        chatRoomId: globalChattingState.channelId,
        image: selectedMedia?.type === "image" ? selectedMediaUrl : null,
        video: selectedMedia?.type === "video" ? selectedMediaUrl : null,
        userId: userInfo?.id,
        id: message._id,
        fullName: userInfo?.fullName,
        avatarUrl: userInfo?.avatarUrl,
      };
      setSelectedMedia(null);
      setSelectedMediaUrl(null);
      socket.emit("chatMessage", messageToSend);
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [
          {
            ...message,
            image: messageToSend?.image,
            video: messageToSend?.video,
          },
        ])
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const onRemoveMedia = () => {
    setSelectedMedia(null);
    setSelectedMediaUrl(null);
  };
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#f0f0f0",
          },
          right: {
            backgroundColor: Colors.primaryBackgroundColor,
          },
        }}
        renderMessageImage={(messageImageProps: any) => (
          <Image
            source={{ uri: messageImageProps.currentMessage.image }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}
        renderMessageVideo={(props) => (
          <MessageVideo currentMessage={props.currentMessage} />
        )}
      />
    );
  };
  return (
    <View className="h-full w-full">
      <SafeAreaView className="bg-primary p-2" edges={["top"]}>
        <View className="flex-row items-center gap-4 pl-2">
          <TouchableRipple
            className="rounded-full p-2"
            borderless
            onPress={() => onBack()}
          >
            <ArrowLeft size={25} color={"white"} strokeWidth={2} />
          </TouchableRipple>
          <View className="flex-row items-center ">
            <Avatar.Image source={{ uri: dataHeader?.avatarUrl }} size={50} />
            <Text className="text-white font-semibold text-lg ml-4">
              {dataHeader?.fullName}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <SafeAreaView className="flex-1 bg-white">
        <GiftedChat
          messages={messages}
          onSend={onSend}
          renderBubble={renderBubble}
          renderInputToolbar={(props) => (
            <CustomInputToolbar
              {...props}
              isClose={channelData?.is_close == 1 ? false : true}
              selectedMedia={selectedMedia}
              onRemoveMedia={async () => {
                setSelectedMedia(null);
                try {
                  const res = await apiClient.delete(
                    `storage/file/delete?url=${selectedMediaUrl}`
                  );
                  const data = await res.data;
                  console.log(data, " result after delete image");
                  setSelectedMediaUrl(null);
                } catch (e) {
                  console.log("Error remove media:", e);
                }
              }}
            />
          )}
          renderUsernameOnMessage={true}
          renderComposer={(props) => (
            <View style={styles.composerContainer}>
              <TouchableRipple onPress={pickMedia} style={styles.mediaButton}>
                <Camera size={24} color={Colors.primaryBackgroundColor} />
              </TouchableRipple>
              <Composer {...props} textInputStyle={styles.textInput} />
            </View>
          )}
          renderSend={(props) => (
            <SendMess {...props} containerStyle={styles.sendButton}>
              <TouchableRipple className="rounded-full p-2" borderless>
                <Send color={Colors.primaryBackgroundColor} size={24} />
              </TouchableRipple>
            </SendMess>
          )}
          user={{
            _id: userInfo?.id ? userInfo.id : "",
            name: userInfo?.fullName,
            avatar: userInfo?.avatarUrl,
          }}
          minInputToolbarHeight={selectedMedia ? 150 : 60}
        />
      </SafeAreaView>
    </View>
  );
};

export default Chatbox;
const styles = StyleSheet.create({
  mediaButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    height: 44,
    justifyContent: "center",
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    marginLeft: 4,
    fontSize: 16,
    lineHeight: 16,
    marginTop: 6,
    marginBottom: 6,
    paddingTop: 0,
    paddingBottom: 0,
  },
  safeArea: {
    backgroundColor: Colors.primaryBackgroundColor,
  },
  container: {
    paddingTop: 10,
  },

  composerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 13,
    margin: 3,
  },
  mediaPreviewItem: {
    height: PREVIEW_HEIGHT - 16,
    width: PREVIEW_HEIGHT - 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  previewVideo: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
    margin: 0,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
    padding: 10,
  },
  playButtonHidden: {
    display: "none",
  },
  inputContainer: {},
  mediaPreviewContainer: {
    height: PREVIEW_HEIGHT - 16,
    width: "100%",
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  messageVideoContainer: {
    position: "relative",
    backgroundColor: "white",
    height: 200,
    minWidth: 200,
    borderRadius: 13,
    margin: 3,
  },
  messageVideo: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  messagePlayButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
    padding: 10,
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
