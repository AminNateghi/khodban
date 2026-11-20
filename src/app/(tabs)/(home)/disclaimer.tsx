import { useTranslation } from "@/languages/useTranslation";
import { useLayoutEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text } from "@/components/Text";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react-native";
import { Theme } from "@/constants";
import { Card } from "@/components/Card";
import { router, useNavigation } from "expo-router";
import { IconButton } from "@/components/IconButton";

export default function DisclaimerScreen() {
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t("disclaimer.title"),
      headerLargeTitle: true,
      headerTitleAlign: "center",
      headerLeft: () =>
        isRTL ? (
          <></>
        ) : (
          <IconButton icon={<ArrowLeftIcon />} onPress={() => router.back()} />
        ),
      headerRight: () =>
        isRTL ? (
          <IconButton icon={<ArrowRightIcon />} onPress={() => router.back()} />
        ) : (
          <></>
        ),
    });
  }, [navigation, t, isRTL]);

  return (
    <ScrollView
      style={[styles.container, { direction: isRTL ? "rtl" : "ltr" }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={{ marginTop: 10 }}>
        <Text style={styles.text}>{t("disclaimer.content")}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  content: {
    padding: 20,
  },
  text: {
    marginTop: 25,
    marginBottom: 25,
    fontSize: Theme.fontSize,
    textAlign: "start",
  },
});
