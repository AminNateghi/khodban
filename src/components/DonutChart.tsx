import { DonutChart as Chart } from "react-native-chart-kit/v2";
import { View } from "react-native";
import { Text } from "./Text";
import { Theme } from "@/constants";
import { useTranslation } from "@/languages/useTranslation";
import { numberFormat } from "@/utils/number-format";
import { useState } from "react";

interface Props {
  totalSpent: number;
  totalFuelCost: number;
  totalServiceCost: number;
  totalExpenses: number;
}

export default function DonutChart(props: Props) {
  const { t, isRTL } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(99); // 99 for total cost

  const total = props.totalSpent;
  const getPercentage = (value: number) =>
    total > 0 ? Math.round((Math.max(value, 0) / total) * 100) : 0;

  const fuelPercentage = getPercentage(props.totalFuelCost);
  const servicePercentage = getPercentage(props.totalServiceCost);
  const expensesPercentage = getPercentage(props.totalExpenses);

  const chartData = [
    {
      label: t("dashboard.expenses"),
      value: expensesPercentage,
      color: Theme.violet,
    },
    {
      label: t("dashboard.serviceCosts"),
      value: servicePercentage,
      color: Theme.mulberry,
    },
    {
      label: t("dashboard.fuelCosts"),
      value: fuelPercentage,
      color: Theme.orange,
    },
  ];

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
        <Text style={{ fontSize: 12 }}>{label}</Text>
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
          <Chart
            data={chartData}
            valueKey="value"
            labelKey="label"
            width={410}
            height={260}
            legend={false}
            centerLabel={
              <>
                {selectedIndex === 99 && (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      {numberFormat(total, { isRTL })}
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                      {t("dashboard.totalSpent")}
                    </Text>
                  </View>
                )}
                {selectedIndex !== 99 && (
                  <View>
                    <Text style={{ textAlign: "center" }}>
                      {chartData[selectedIndex]?.label}
                    </Text>
                    <Text style={{ textAlign: "center" }}>
                      {numberFormat(chartData[selectedIndex]?.value, { isRTL })}
                      %
                    </Text>
                  </View>
                )}
              </>
            }
            interaction={{
              mode: "tap",
              onSelect: (event) => setSelectedIndex(event.index),
              onDeselect: () => setSelectedIndex(99),
            }}
            activeSlice={{ inactiveOpacity: 0.36, strokeWidth: 2 }}
          />
        </View>

        {/* Legend */}
        <View
          style={{
            flexDirection: "row",
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
