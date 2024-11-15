import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import FetchResponse from "../../types/responses/FetchResponse";
import TestModel from "../../types/models/TestModel";
import apiClient from "../../services/api-services/api-client";
import { endpoints } from "../../services/api-services/api-service-instances";
import useCounterState from "@/hooks/states/useCounterState";
import useFetchWithRQWithFetchFunc from "@/hooks/fetching/useFetchWithRQWithFetchFunc";
import REACT_QUERY_CACHE_KEYS from "@/constants/react-query-cache-keys";
import ScrollPicker from "react-native-wheel-scrollview-picker";

let times = 0;

const Chatting = () => {
  console.log("rendering...." + ++times);

  const counter = useCounterState((state) => state.counter);
  const increment = useCounterState((state) => state.increment);
  const reset = useCounterState((state) => state.reset);
  const changeMax = useCounterState((state) => state.changeMax);
  const [toggle, setToggle] = useState(true);

  const fetch = useFetchWithRQWithFetchFunc(
    REACT_QUERY_CACHE_KEYS.TEST,
    (): Promise<FetchResponse<TestModel>> =>
      apiClient.get(endpoints.TEST).then((response) => response.data),
    [toggle]
  );

  const { data } = fetch;
  useEffect(() => {
    console.log(fetch);
  }, [fetch.isLoading]);
  const [selected, setSelected] = useState(0);
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ScrollPicker
        dataSource={["1", "2", "3", "4", "5", "6"]}
        selectedIndex={selected}
        renderItem={(item, index) => {
          return (
            <Text
              className={`h-[100px] text-md text-gray-600 ${
                index == selected ? "font-semibold text-blue-900" : ""
              }`}
            >
              {item}
            </Text>
          );
        }}
        onValueChange={(value, index) => setSelected(index)}
      />
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Vite + React Native
        </Text>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>
          Zustand State Management Demo
        </Text>
      </View>
      <View style={{ marginBottom: 20 }}>
        <Button title={`Count is ${counter}`} onPress={increment} />
        <Button title="Reset" onPress={reset} color="grey" />
        <Button
          title="Change Max to 7"
          onPress={() => changeMax(7)}
          color="blue"
        />
        <Button
          title="Toggle"
          onPress={() => setToggle(!toggle)}
          color="green"
        />
      </View>
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "darkblue",
            marginBottom: 10,
          }}
        >
          React Query Fetching Demo
        </Text>
        {data?.value?.items?.map((model) => (
          <View
            key={model.id}
            style={{
              marginBottom: 10,
              borderBottomWidth: 1,
              paddingBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {model.name}
            </Text>
            <Text style={{ fontSize: 14, color: "grey" }}>
              {model.description}
            </Text>
          </View>
        ))}
      </View>
      <Text style={{ textAlign: "center", marginTop: 20, color: "grey" }}>
        Edit <Text style={{ fontWeight: "bold" }}>src/App.tsx</Text> and save to
        test HMR
      </Text>
    </ScrollView>
  );
};

export default Chatting;
