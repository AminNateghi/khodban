import { PieChart } from "react-native-gifted-charts";
import { View } from "react-native";
import { Text } from "./Text";
import { Theme } from "@/constants";
import { useTranslation } from "@/languages/useTranslation";

interface Props {
  totalSpent: number;
  totalFuelCost: number;
  totalServiceCost: number;
  totalExpenses: number;
}

export default function DonutChart(props: Props) {
  const { t, isRTL } = useTranslation();

  const total = props.totalSpent;
  const getPercentage = (value: number) =>
    total > 0 ? Math.round((Math.max(value, 0) / total) * 100) : 0;

  const fuelPercentage = getPercentage(props.totalFuelCost);
  const servicePercentage = getPercentage(props.totalServiceCost);
  const expensesPercentage = getPercentage(props.totalExpenses);

  const formatAmount = (value: number) =>
    `${value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;

  const categories = [
    {
      value: expensesPercentage,
      color: Theme.violet,
      gradientCenterColor: Theme.violet,
      focused: false,
    },
    {
      value: servicePercentage,
      color: Theme.mulberry,
      gradientCenterColor: Theme.mulberry,
      focused: false,
    },
    {
      value: fuelPercentage,
      color: Theme.orange,
      gradientCenterColor: Theme.orange,
      focused: false,
    },
  ];

  // Highlight the category with the highest value
  const maxIndex = categories.reduce(
    (max, item, index, array) => (item.value > array[max].value ? index : max),
    0,
  );

  if (total > 0) {
    categories[maxIndex].focused = true;
  }

  const pieData = categories.filter((item) => item.value > 0);

  const renderDot = (color: string) => (
    <View
      style={{
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: isRTL ? 0 : 8,
        marginLeft: isRTL ? 8 : 0,
      }}
    />
  );

  const renderLegendItem = (color: string, label: string) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginVertical: 4,
      }}
    >
      {renderDot(color)}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13 }}>{label}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: Theme.surface,
          borderRadius: 16,
          padding: 16,
          flex: 1,
          marginBottom: 12,
        }}
      >
        <View style={{ padding: 20, alignItems: "center" }}>
          <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            radius={90}
            innerRadius={60}
            innerCircleColor={Theme.surface}
            centerLabelComponent={() => (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  {formatAmount(total)}
                </Text>
                <Text style={{ fontSize: 12 }}>
                  {t("dashboard.totalSpent")}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Legend */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          {renderLegendItem(Theme.orange, t("dashboard.fuelCosts"))}
          {renderLegendItem(Theme.mulberry, t("dashboard.serviceCosts"))}
          {renderLegendItem(Theme.violet, t("dashboard.expenses"))}
        </View>
      </View>
    </View>
  );
}
