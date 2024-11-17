import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView, Alert } from "react-native";
import FetchResponse from "../../types/responses/FetchResponse";
import TestModel from "../../types/models/TestModel";
import apiClient from "../../services/api-services/api-client";
import { endpoints } from "../../services/api-services/api-service-instances";
import useCounterState from "@/hooks/states/useCounterState";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import useGlobalHeaderPage from "@/hooks/states/useGlobalHeaderPage";
import { useFocusEffect } from "expo-router";
import PubNub from "pubnub";
import { PubNubProvider } from "pubnub-react";
import { Chat, MemberList } from "@pubnub/react-native-chat-components";
const members = [
  {
    name: "Mark Kelley",
    custom: {
      title: "Office Assistant",
    },
    email: null,
    eTag: "AYGyoY3gre71eA",
    externalId: null,
    id: "user_63ea15931d8541a3bd35e5b1f09087dc",
    profileUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    updated: "2020-09-23T09:23:34.598494Z",
  },
  {
    name: "Anna Gordon",
    custom: {
      title: "VP Marketing",
    },
    email: null,
    eTag: "AZDyqJ7andTHlAE",
    externalId: null,
    id: "user_3c4400761cba4b65b77b6cae55fc21eb",
    profileUrl: "https://randomuser.me/api/portraits/women/1.jpg",
    updated: "2020-09-23T09:23:33.598365Z",
  },
  {
    name: "Luis Griffin",
    custom: {
      title: "Environmental Tech",
    },
    email: null,
    eTag: "AeTqgs2X16ql2wE",
    externalId: null,
    id: "user_def709b1adfc4e67b98bb7a820f581b1",
    profileUrl: "https://randomuser.me/api/portraits/men/2.jpg",
    updated: "2020-09-23T09:23:31.809198Z",
  },
  {
    name: "Sue Flores",
    custom: {
      title: "VP Sales",
    },
    email: null,
    eTag: "Acmf1d+vmczaKw",
    externalId: null,
    id: "user_a56c20222c484ff8987ec9b69b0c8f5b",
    profileUrl: "https://randomuser.me/api/portraits/women/2.jpg",
    updated: "2020-09-23T09:23:31.837372Z",
  },
  {
    name: "Luke Young",
    custom: {
      title: "Product Engineer",
    },
    email: null,
    eTag: "AczQlJSt5Zn9jAE",
    externalId: null,
    id: "user_e0e43601f93249c382415521188f0208",
    profileUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    updated: "2020-09-23T09:23:36.617721Z",
  },
  {
    name: "Jenny Porter",
    custom: {
      title: "Engineer",
    },
    email: null,
    eTag: "AZSThaqOxP67Rg",
    externalId: null,
    id: "user_ed145d8b0f094b83a2d51d428a59d0cb",
    profileUrl: "https://randomuser.me/api/portraits/women/3.jpg",
    updated: "2020-09-23T09:23:32.810646Z",
  },
  {
    name: "Sue Jones",
    custom: {
      title: "Desktop Support Technician",
    },
    email: null,
    eTag: "AZi01cCxr8eo5AE",
    externalId: null,
    id: "user_912210948aa849eda2c3e0c2b58355e6",
    profileUrl: "https://randomuser.me/api/portraits/women/10.jpg",
    updated: "2020-09-23T09:23:34.54631Z",
  },
  {
    name: "Marie Harper",
    custom: {
      title: "Technical Writer",
    },
    email: null,
    eTag: "Ad2mzoKft7HsWQ",
    externalId: null,
    id: "user_0368d27f4d514079bc5cfd5678ec1fe7",
    profileUrl: "https://randomuser.me/api/portraits/women/12.jpg",
    updated: "2020-09-23T09:23:32.180254Z",
  },
  {
    name: "Tom Martinez",
    custom: {
      title: "Product Engineer",
    },
    email: null,
    eTag: "Ad/X1fzkiOTFzwE",
    externalId: null,
    id: "user_83647bfb6bcd412d93b1e57e1b602d3a",
    profileUrl: "https://randomuser.me/api/portraits/men/13.jpg",
    updated: "2020-09-23T09:23:31.848064Z",
  },
  {
    name: "Veronica Barrett",
    custom: {
      title: "Registered Nurse",
    },
    email: null,
    eTag: "AZuL1I+IxJPm4gE",
    externalId: null,
    id: "user_4ec689d24845466e93ee358c40358473",
    profileUrl: "https://randomuser.me/api/portraits/women/15.jpg",
    updated: "2020-09-23T09:23:31.819548Z",
  },
];
const pubnub = new PubNub({
  publishKey: "demo",
  subscribeKey: "demo",
  userId: "user_a56c20222c484ff8987ec9b69b0c8f5b",
});
const currentChannel = "Default";
const theme = "light";
const Chatting = () => {
  const globalHeaderPage = useGlobalHeaderPage();
  useFocusEffect(
    React.useCallback(() => {
      globalHeaderPage.setIsChattingFocusing(true);
      return () => {
        globalHeaderPage.setIsChattingFocusing(false);
      };
    }, [])
  );

  return (
    <View className="pt-3 bg-white flex-1">
      <PubNubProvider client={pubnub}>
        <Chat {...{ currentChannel, theme }}>
          <MemberList
            members={members}
            presentMembers={[
              "user_3c4400761cba4b65b77b6cae55fc21eb",
              "user_def709b1adfc4e67b98bb7a820f581b1",
              "user_a56c20222c484ff8987ec9b69b0c8f5b",
            ]}
            // selfText="(Me)"
            // sort={(m1, m2) => (m1.name > m2.name ? -1 : 1)}
            // extraActionsRenderer={(m) => (
            //   <Button title="Info" onPress={() => alert(`Info about ${m.name}`)} />
            // )}
            // memberRenderer={(m) => <Text>{m.name + (m.profileUrl || "")}</Text>}
            onMemberClicked={(m) => Alert.alert(`Clicked: ${m.name}`)}
            // onMemberLongPressed={(m) => alert(`Long pressed: ${m.name}`)}
            style={{
              memberPressed: {
                backgroundColor: "#f0fdfa",
              },
              member: {
                borderWidth: 0.2,
                borderColor: "#cffafe",
              },
            }}
          />
        </Chat>
      </PubNubProvider>
    </View>
  );
};

export default Chatting;
