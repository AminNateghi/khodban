import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  BoxIcon,
  CarIcon,
  HardDriveIcon,
  HistoryIcon,
  MessageSquareTextIcon,
  TimerIcon,
  XIcon,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "@/languages/useTranslation";
import { Text } from "./Text";
import { Theme, GlobalStyles } from "@/constants";
import Language from "./Language";
import MenuItem from "./MenuItem";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AppDrawer({ visible, onClose }: Props) {
  const { t, isRTL } = useTranslation();

  const handleDatabase = () => {
    onClose();
    router.push("/(tabs)/(home)/database");
  };

  const handleShowRecentChanges = () => {
    onClose();
    router.push("/(tabs)/(home)/recent-changes");
  };

  const handleVehicles = () => {
    onClose();
    router.navigate("/(tabs)/(home)/vehicles");
  };

  const handleReminders = () => {
    onClose();
    router.navigate("/(tabs)/(home)/reminders");
  };

  const handleDisclaimer = () => {
    onClose();
    router.navigate("/(tabs)/(home)/disclaimer");
  };

  const handleAbout = () => {
    onClose();
    router.navigate("/about");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[isRTL && GlobalStyles.rtl]}>
        <Pressable
          onPress={onClose}
          accessibilityLabel={t("drawer.closeDrawer")}
        />

        <View style={styles.drawer}>
          <View style={styles.header}>
            <View style={styles.iconRow}>
              <Image
                source={require("./../../assets/images/icon-transparency.png")}
                style={styles.icon}
              />
              <View>
                <Text style={styles.appName}>{t("app.name")}</Text>
                <Text style={styles.subtitle}>{t("app.description")}</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel={t("drawer.closeDrawer")}
              accessibilityRole="button"
            >
              <XIcon size={22} />
            </Pressable>
          </View>

          <View style={GlobalStyles.separator} />

          <ScrollView
            style={styles.drawerContent}
            showsVerticalScrollIndicator={false}
          >
            <MenuItem
              icon={<CarIcon size={21} color={Theme.primary} />}
              title={t("drawer.vehicles")}
              description={t("drawer.subitemVehicle")}
              onPress={handleVehicles}
            />
            <MenuItem
              icon={<TimerIcon size={21} color={Theme.green} />}
              title={t("drawer.itemReminder")}
              description={t("drawer.subitemReminder")}
              onPress={handleReminders}
            />

            <View style={GlobalStyles.separator} />
            <MenuItem
              icon={<BoxIcon size={21} color={Theme.primaryDark} />}
              title={t("drawer.itemAbout")}
              description={t("drawer.subitemAbout")}
              onPress={handleAbout}
            />
            <MenuItem
              icon={<HistoryIcon size={21} color={Theme.mulberry} />}
              title={t("drawer.itemRecentChanges")}
              description={t("drawer.subitemRecentChanges")}
              onPress={handleShowRecentChanges}
            />

            <Language />

            <MenuItem
              icon={<HardDriveIcon size={21} color={Theme.text} />}
              title={t("drawer.itemDatabase")}
              description={t("drawer.subitemDatabase")}
              onPress={handleDatabase}
            />
            <View style={GlobalStyles.separator} />
            <MenuItem
              icon={<MessageSquareTextIcon size={21} color={Theme.orange} />}
              title={t("drawer.disclaimer")}
              description={t("drawer.disclaimerPrompt")}
              onPress={handleDisclaimer}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("app.madeWithLove")}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: "100%",
    height: "100%",
    backgroundColor: Theme.background,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 22,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: Theme.text,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: Theme.border + 20,
  },
  drawerContent: {
    flex: 1,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Theme.border + 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 12,
  },
  icon: { width: 45, height: 45, borderRadius: 12 },
  iconRow: {
    flexDirection: "row",
    gap: 10,
    alignContent: "center",
    alignItems: "center",
  },
});
