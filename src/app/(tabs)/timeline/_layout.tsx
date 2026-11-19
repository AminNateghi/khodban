import { Stack } from "expo-router";
import { ScreenStyle } from "@/constants";

export default function TimelineLayout() {
  return (
    <Stack screenOptions={{ ...ScreenStyle }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
