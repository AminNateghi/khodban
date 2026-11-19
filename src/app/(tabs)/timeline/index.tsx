import { useLayoutEffect, useMemo } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import {
  BanknoteIcon,
  FuelIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react-native";
import { router, useNavigation } from "expo-router";
import { EmptyState } from "@/components/EmptyState";
import { RecordCard } from "@/components/RecordCard";
import { Text } from "@/components/Text";
import { Theme } from "@/constants";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useTranslation } from "@/languages/useTranslation";
import { useActiveVehicle } from "@/repositories/active-vehicle";
import { useExpenses } from "@/repositories/expense-repository";
import { useFuels } from "@/repositories/fuel-repository";
import { useServices } from "@/repositories/service-repository";
import { getExpenseTypeTitle, getServiceTypeTitle } from "@/types/interfaces";
import type { ExpenseDto, FuelDto, ServiceDto } from "@/types/interfaces";
import { calendarMonthKey, monthYearFormat } from "@/utils/date-format";
import { numberFormat } from "@/utils/number-format";

type TimelineRecord = {
  id: number;
  type: "fuel" | "service" | "expense";
  date: Date;
  title: string;
  amount: number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
};

type TimelineSection = {
  key: string;
  title: string;
  data: TimelineRecord[];
};

function getFuelUnit(
  fuel: FuelDto,
  activeVehicle: ReturnType<typeof useActiveVehicle>["data"],
  t: ReturnType<typeof useTranslation>["t"],
  isRTL: boolean,
) {
  const fuelType =
    fuel.fuelTank === "Second"
      ? (activeVehicle?.secondFuelType ?? activeVehicle?.fuelType)
      : activeVehicle?.fuelType;

  if (fuelType === "CNG/LPG")
    return t(isRTL ? "fuelUnit.faKilogram" : "fuelUnit.Kilogram");
  if (fuelType === "Electric" || fuelType === "Hybrid")
    return t(isRTL ? "fuelUnit.faKilowatt" : "fuelUnit.Kilowatt");
  if (fuelType === "Other") return t("fuel.unit");
  return t(isRTL ? "fuelUnit.faLiters" : "fuelUnit.Liters");
}

export default function TimelineScreen() {
  const { t, isRTL, currencySymbol } = useTranslation();
  const navigateOnce = useNavigationGuard();
  const navigation = useNavigation();
  const { data: activeVehicle } = useActiveVehicle();
  const { data: fuels } = useFuels();
  const { data: services } = useServices();
  const { data: expenses } = useExpenses();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t("menus.timeline"),
      headerLargeTitle: true,
      headerTitleAlign: "center",
    });
  }, [navigation, t]);

  const sections = useMemo(() => {
    const records: TimelineRecord[] = [
      ...(fuels ?? []).map((fuel) => ({
        id: fuel.id,
        type: "fuel" as const,
        date: fuel.date,
        title: `${numberFormat(fuel.liters, { isRTL })} ${getFuelUnit(fuel, activeVehicle, t, isRTL)}`,
        amount: fuel.totalCost,
        icon: FuelIcon,
        color: Theme.orange,
      })),
      ...(services ?? []).map((service: ServiceDto) => ({
        id: service.id,
        type: "service" as const,
        date: service.date,
        title: getServiceTypeTitle(service.type, t),
        amount: service.cost,
        icon: WrenchIcon,
        color: Theme.mulberry,
        subtitle: `${numberFormat(service.odometer, { isRTL })} ${t("common.odometer")}`,
      })),
      ...(expenses ?? []).map((expense: ExpenseDto) => ({
        id: expense.id,
        type: "expense" as const,
        date: expense.date,
        title: getExpenseTypeTitle(expense.type, t),
        amount: expense.amount,
        icon: BanknoteIcon,
        color: Theme.violet,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const grouped = new Map<string, TimelineSection>();
    for (const record of records) {
      const key = calendarMonthKey(isRTL, record.date);
      let section = grouped.get(key);
      if (!section) {
        section = {
          key,
          title: monthYearFormat(isRTL, record.date),
          data: [],
        };
        grouped.set(key, section);
      }
      section.data.push(record);
    }

    return Array.from(grouped.values());
  }, [activeVehicle, expenses, fuels, isRTL, services, t]);

  const isLoaded =
    fuels !== undefined && services !== undefined && expenses !== undefined;

  const openRecord = (record: TimelineRecord) => {
    const pathname =
      record.type === "fuel"
        ? "/fuel/form"
        : record.type === "service"
          ? "/services/form"
          : "/expenses/form";
    navigateOnce(() =>
      router.push({
        pathname,
        params: { id: String(record.id) },
      }),
    );
  };

  return (
    <View style={[styles.wrapper, isRTL && { direction: "rtl" }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderSectionHeader={({ section }) => (
          <Text style={styles.monthHeading}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <RecordCard
            id={item.id}
            title={item.title}
            date={item.date}
            amount={item.amount}
            help={currencySymbol}
            subtitle={item.subtitle}
            icon={item.icon}
            color={item.color}
            rtl={isRTL}
            onPress={() => openRecord(item)}
          />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          isLoaded ? (
            <EmptyState
              icon={FuelIcon}
              title={t("timeline.emptyTitle")}
              subtitle={t("timeline.emptyDescription")}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  monthHeading: {
    fontSize: 18,
    fontWeight: 700,
    color: Theme.text,
    marginTop: 8,
    marginBottom: 12,
    textAlign: "start",
  },
});
