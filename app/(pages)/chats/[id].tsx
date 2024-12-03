import useGlobalAuthState from "@/hooks/states/useGlobalAuthState";
import useGlobalSocketState from "@/hooks/states/useGlobalSocketState";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
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
  IMessage,
  InputToolbar,
  Send as SendMess,
} from "react-native-gifted-chat";
import { Avatar, IconButton, TouchableRipple } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@/services/api-services/api-client";
import ChatboxColors from "@/constants/ChatboxColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PREVIEW_HEIGHT = 150;

interface Media {
  uri: string;
  type: "image" | "video" | "livePhoto" | "pairedVideo" | undefined;
  preview: boolean;
}

interface ChatMessage {
  _id: string;
  text: string;
  image: string | undefined;
  video: string | undefined;
  user: any; // use proper user type if available
  createdAt: string;
}

interface ChatData {
  customer: any; // use proper customer type
  shop: any; // use proper shop type
  deliveryStaff: any; // use proper deliveryStaff type
  avatarUrl: string;
}

const MediaPreview = ({
  media,
  onRemove,
}: {
  media: Media;
  onRemove: () => void;
}) => {
  const videoRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const params = useLocalSearchParams();
  const chatRoomId = Array.isArray(params.id) ? params.id[0] : params.id;

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
          // Check if status is a valid playback status (not an error)
          if ("isPlaying" in status && !("error" in status)) {
            setIsPlaying(status.isPlaying); // Now it's safe to access `isPlaying`
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
  ...props
}: {
  selectedMedia: Media | null;
  onRemoveMedia: () => void;
}) => {
  return (
    <View style={styles.inputContainer}>
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
          borderColor: ChatboxColors.primaryBackgroundColor,
          marginHorizontal: 15,
          marginBottom: 4,
          ...styles.shadow,
        }}
      />
    </View>
  );
};

const MessageVideo = ({
  currentMessage,
}: {
  currentMessage: any; // Replace with proper type if available
}) => {
  const videoRef = useRef<any>(null);
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

const ChatChannel = () => {
  const globalAuthState = useGlobalAuthState();
  const globalSocketState = useGlobalSocketState();
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const userInfo = globalAuthState.authDTO;
  const { socket } = globalSocketState;

  const pickMedia = async () => {
    try {
      if (Platform.OS !== "web") {
        const libraryStatus =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus.status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }

        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== "granted") {
          alert("Sorry, we need camera permissions to make this work!");
        }
      }

      console.log("Picking media");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });
      console.log(result);
      if (!result.canceled) {
        const asset = result.assets[0];
        console.log(result, "result");

        const mediaUrl = await uploadMedia(
          asset.uri,
          asset.type || (asset.uri.endsWith(".mp4") ? "video" : "image"),
        );
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

  const uploadMedia = async (uri: string, fileType: string) => {
    try {
      const formData = new FormData();

      formData.append("file", {
        uri,
        name: `media-${Date.now()}.${fileType === "video" ? "mp4" : "jpg"}`,
        type: fileType === "video" ? "video/mp4" : "image/jpeg",
      } as any);

      const res = await apiClient.put(`storage/file/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.data;
      if (data.isSuccess) {
        return data?.value?.url;
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleGetChatData = async () => {
    try {
      const res = await apiClient.get(`order/${params.id}/chat-info`);
      const data = await res.data;
      if (data.isSuccess) {
        setChatData(data.value);
      }
    } catch (error) {
      // console.error(error, " erorsefasdfasf");
    }
  };

  useEffect(() => {
    handleGetChatData();
    // dispatch(globalSlice.actions.setCurrentScreen("chat"));
    // return () => {
    //   dispatch(globalSlice.actions.setCurrentScreen(""));
    // };
  }, []);

  useEffect(() => {
    if (chatData && socket) {
      try {
        socket.emit("joinRoomsChat", {
          chatRoomId: chatRoomId,
          chatData,
        });
        setChatRoomId(chatRoomId);
      } catch (error) {
        console.error(error);
      }
    }
  }, [chatData]);

  useEffect(() => {
    socket?.on("receiveMessage", (message: any) => {
      setMessages((prevMessages) => {
        const newMessages = [
          {
            _id: message.id,
            text: message.content,
            image: message.image,
            video: message.video,
            user: {
              _id: message?.sender?.id,
              name: message?.sender?.name,
              avatar: message?.sender?.avatar,
            },
            createdAt: message.createdAt,
          },
          ...prevMessages,
        ];
        return newMessages;
      });
    });
  }, [socket]);

  const handleSendMessage = async (newMessages: any[]) => {
    const message = newMessages[0];

    socket?.emit("sendMessage", {
      chatRoomId,
      content: message.text,
      image: message.image || null,
      video: message.video || null,
    });

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages),
    );
  };
  const onSend = async (newMessages: IMessage[] = []) => {
    try {
      if (!socket) return;

      const [message] = newMessages;
      console.log(message, " new messages");
      const messageToSend = {
        text: message.text,
        chatRoomId: Number(params.id),
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
            image: messageToSend?.image || undefined,
            video: messageToSend?.video || undefined,
          },
        ]),
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBackButton}
        >
          <ArrowLeft />
        </Pressable>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: userInfo?.id || Math.random() % 100_000_000 }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              left: { backgroundColor: "lightgray" },
              right: { backgroundColor: "#0084ff" },
            }}
          />
        )}
        renderInputToolbar={(props) => (
          <CustomInputToolbar
            {...props}
            selectedMedia={selectedMedia}
            onRemoveMedia={() => setSelectedMedia(null)}
          />
        )}
        renderSend={(props) => (
          <SendMess
            {...props}
            label="Send"
            containerStyle={styles.sendButtonContainer}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerBackButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  mediaPreviewContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  mediaPreviewItem: {
    marginBottom: 10,
    position: "relative",
  },
  previewImage: {
    width: SCREEN_WIDTH - 30,
    height: PREVIEW_HEIGHT,
    borderRadius: 10,
  },
  previewVideo: {
    width: SCREEN_WIDTH - 30,
    height: PREVIEW_HEIGHT,
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  playButtonHidden: {
    display: "none",
  },
  inputContainer: {
    marginBottom: 10,
  },
  messageVideoContainer: {
    width: SCREEN_WIDTH - 50,
    height: PREVIEW_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  messageVideo: {
    width: "100%",
    height: "100%",
  },
  messagePlayButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  sendButtonContainer: {
    marginLeft: 5,
    marginBottom: 10,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default ChatChannel;
