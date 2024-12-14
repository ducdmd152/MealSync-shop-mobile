import { Stack } from 'expo-router';
import React from 'react';
const ChatLayout = () => {
 
  return (
    <Stack screenOptions={{ animation: 'slide_from_bottom' }}>
      <Stack.Screen name="[id]" options={{ animation: 'slide_from_bottom', headerShown: false }} />
      <Stack.Screen name="index" options={{ animation: 'slide_from_bottom', headerShown: false }} />
    </Stack>
  );
};

export default ChatLayout;
