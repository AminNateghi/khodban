import { useEffect, useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlobalStyles } from "@/constants";
import { useTranslation } from "@/languages/useTranslation";
import { Input } from "@/components/Input";
import { SegmentedButtons } from "@/components/SegmentedButtons";
import { type FuelFormData, fuelSchema } from "@/types/fuel-schema";
import {
  useCreateFuel,
  useGetFuel,
  useUpdateFuel,
} from "@/repositories/fuel-repository";
import type { FuelDto } from "@/types/interfaces";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { DatePicker } from "@/components/DatePicker";
import { Text } from "@/components/Text";
import { SwitchToggle } from "@/components/SwitchToggle";
import { FuelDeletionModal } from "@/components/forms/FuelDeletionModal";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useStatistics } from "@/repositories/statistics";
import { numberFormat, numberToPersianWord } from "@/utils/number-format";
import { useActiveVehicle } from "@/repositories/active-vehicle";
import { SoldVehicleNotice } from "@/components/SoldVehicleNotice";
import { Toast } from "@/components/CustomToast";
import { IconButton } from "@/components/IconButton";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react-native";
import dayjs from "dayjs";

const defaultValues = {
  date: dayjs().toISOString(),
  fuelTank: "First" as const,
  fullTank: true,
  liters: undefined,
  odometer: undefined,
  pricePerLiter: undefined,
  totalCost: undefined,
  note: "",
  station: "",
};

export default function FuelForm() {
  const params = useLocalSearchParams<{ id: string }>();
  const [id] = useState<number>(Number(params.id));
  const { t, isRTL, currencySymbol, fuelUnit } = useTranslation();
  const { data: activeVehicle } = useActiveVehicle();
  const { statistics } = useStatistics();
  const navigation = useNavigation();
  const isEditMode = !!id;

  const { mutate: updateService, isPending: isPendingUpdate } =
    useUpdateFuel(id);
  const { mutate: createService, isPending: isPendingCreate } = useCreateFuel();
  const { data } = useGetFuel(id);

  const schema = fuelSchema(t);
  const {
    watch,
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLargeTitle: true,
      headerTitleAlign: "center",
      title: isEditMode ? t("fuel.updateTitle") : t("fuel.createTitle"),
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
  }, [navigation, t, isEditMode, isRTL]);

  useEffect(() => {
    if (!data || !id) return;

    setLastEdited(null);

    reset({
      date: String(data.date),
      note: data.note,
      odometer: data.odometer,
      fullTank: data.fullTank,
      fuelTank: data.fuelTank ?? "First",
      liters: data.liters,
      pricePerLiter: data.pricePerLiter,
      station: data.station,
      totalCost: data.totalCost,
    });
  }, [data, id, reset]);

  useEffect(() => {
    if (!data || !id) {
      return;
    }

    // fill form in edit mode
    reset({
      date: String(data.date),
      note: data.note,
      odometer: data.odometer,
      fullTank: data.fullTank,
      fuelTank: data.fuelTank ?? "First",
      liters: data.liters,
      pricePerLiter: data.pricePerLiter,
      station: data.station,
      totalCost: data.totalCost,
    });
  }, [data, id, reset]);

  type FuelAmountField = "liters" | "pricePerLiter" | "totalCost";

  const [liters, pricePerLiter, totalCost] = watch([
    "liters",
    "pricePerLiter",
    "totalCost",
  ]);
  const fuelTank = watch("fuelTank");
  const selectedFuelType =
    fuelTank === "Second"
      ? (activeVehicle?.secondFuelType ?? activeVehicle?.fuelType)
      : activeVehicle?.fuelType;
  const fuelLabels =
    selectedFuelType === "CNG/LPG"
      ? {
          quantity: t("fuel.quantityKilograms"),
          price: t("fuel.pricePerKilogram"),
          helpLabel: t("fuelUnit.faKilogram"),
        }
      : selectedFuelType === "Electric" || selectedFuelType === "Hybrid"
        ? {
            quantity: t("fuel.quantityWatts"),
            price: t("fuel.pricePerWatt"),
            helpLabel: t("fuelUnit.faKilowatt"),
          }
        : selectedFuelType === "Other"
          ? {
              quantity: t("fuel.quantityUnits"),
              price: t("fuel.pricePerUnit"),
              helpLabel: "",
            }
          : {
              quantity: t("fuel.quantityLiters"),
              price: t("fuel.pricePerLiter"),
              helpLabel: t("fuelUnit.faLiters"),
            };

  const [lastEdited, setLastEdited] = useState<FuelAmountField | null>(null);

  useEffect(() => {
    const parseAmount = (value: unknown): number | undefined => {
      if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
      }

      if (typeof value !== "string" || value.trim() === "") {
        return undefined;
      }

      const parsed = Number(value.trim().replace(",", "."));

      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const roundAmount = (value: number, decimals: number) =>
      Number(value.toFixed(decimals));

    const l = parseAmount(liters);
    const p = parseAmount(pricePerLiter);
    const total = parseAmount(totalCost);

    let fieldToUpdate: FuelAmountField | null = null;
    let calculatedValue: number | undefined;
    let currentValue: number | undefined;

    // Liters + price → total cost
    if (l !== undefined && p !== undefined && total === undefined) {
      fieldToUpdate = "totalCost";
      calculatedValue = roundAmount(l * p, 2);
      currentValue = total;
    }

    // Liters + total → price per liter
    else if (
      l !== undefined &&
      total !== undefined &&
      p === undefined &&
      l > 0
    ) {
      fieldToUpdate = "pricePerLiter";
      calculatedValue = roundAmount(total / l, 2);
      currentValue = p;
    }

    // Price + total → liters
    else if (
      p !== undefined &&
      total !== undefined &&
      l === undefined &&
      p > 0
    ) {
      fieldToUpdate = "liters";
      calculatedValue = roundAmount(total / p, 2);
      currentValue = l;
    }

    // All three have values: synchronize based on the last edited field
    else if (l !== undefined && p !== undefined && total !== undefined) {
      if (lastEdited === "liters" || lastEdited === "pricePerLiter") {
        fieldToUpdate = "totalCost";
        calculatedValue = roundAmount(l * p, isRTL ? 0 : 2);
        currentValue = total;
      } else if (lastEdited === "totalCost" && p > 0) {
        fieldToUpdate = "liters";
        calculatedValue = roundAmount(total / p, 2);
        currentValue = l;
      }
    }

    if (fieldToUpdate === null || calculatedValue === undefined) {
      return;
    }

    // Never overwrite the field currently being edited
    if (fieldToUpdate === lastEdited) {
      return;
    }

    if (
      currentValue !== undefined &&
      Math.abs(currentValue - calculatedValue) < 0.000001
    ) {
      return;
    }

    setValue(fieldToUpdate, calculatedValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [liters, pricePerLiter, totalCost, lastEdited, isRTL, setValue]);

  const handleResetForm = () => {
    setLastEdited(null);
    reset(defaultValues);
  };

  const handleClose = () => {
    handleResetForm();
    router.back();
  };

  const handleSave = async (formData: FuelFormData) => {
    const fuel: Omit<FuelDto, "id" | "vehicleId"> = {
      date: new Date(formData.date),
      odometer: formData.odometer,
      note: formData.note ?? null,
      fullTank: formData.fullTank,
      fuelTank: formData.fuelTank,
      liters: formData.liters,
      pricePerLiter: formData.pricePerLiter,
      totalCost: Number(formData.totalCost),
      station: formData.station ?? null,
    };

    const callbacks = {
      onSuccess: handleClose,
      onError: () =>
        Toast({ text: t("vehicles.recordSaveFailed"), type: "error" }),
    };

    if (id) updateService(fuel, callbacks);
    else createService(fuel, callbacks);
  };

  if (activeVehicle?.sold) {
    return <SoldVehicleNotice onClose={handleClose} />;
  }

  return (
    <KeyboardAwareScrollView
      style={[GlobalStyles.modalScroll, isRTL && { direction: "rtl" }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Controller
        control={control}
        name="date"
        render={({ field: { value, onChange } }) => (
          <>
            <DatePicker
              label={t("fuel.date")}
              value={value}
              onChange={onChange}
              error={errors.date?.message}
            />
          </>
        )}
      />

      <Controller
        control={control}
        name="odometer"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label={t("fuel.odometer")}
            value={value?.toString() ?? ""}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="numeric"
            placeholder={t("fuel.odometerPlaceholder")}
            style={{ direction: "ltr" }}
            error={errors?.odometer?.message}
            help={`${t("dashboard.latestOdometer")} ${numberFormat(statistics.distance.latestOdometer, { isRTL })}`}
          />
        )}
      />

      {activeVehicle?.secondFuelType && (
        <Controller
          control={control}
          name="fuelTank"
          render={({ field: { value, onChange } }) => (
            <SegmentedButtons
              label={t("fuel.tank")}
              value={value ?? "First"}
              buttons={[
                { label: t("fuel.firstTank"), value: "First" },
                { label: t("fuel.secondTank"), value: "Second" },
              ]}
              onValueChange={(tank) => {
                if (tank === "First" || tank === "Second") {
                  onChange(tank);
                }
              }}
            />
          )}
        />
      )}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Controller
          control={control}
          name="liters"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={fuelLabels.quantity}
              value={value?.toString() ?? ""}
              onBlur={onBlur}
              onChangeText={(value) => {
                setLastEdited("liters");
                onChange(value);
              }}
              keyboardType="decimal-pad"
              placeholder={t("fuel.litersPlaceholder")}
              style={{ direction: "ltr", flex: 1 }}
              startElement={<Text>{fuelLabels.helpLabel}</Text>}
              error={errors?.liters?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="pricePerLiter"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={fuelLabels.price}
              value={value?.toString() ?? ""}
              onBlur={onBlur}
              onChangeText={(value) => {
                setLastEdited("pricePerLiter");
                onChange(value);
              }}
              keyboardType="decimal-pad"
              placeholder={t("fuel.pricePlaceholder")}
              style={{ direction: "ltr", flex: 1 }}
              startElement={<Text>{currencySymbol}</Text>}
              error={errors?.pricePerLiter?.message}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="totalCost"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label={t("fuel.totalCost")}
            value={value?.toString() ?? ""}
            onBlur={onBlur}
            onChangeText={(value) => {
              setLastEdited("totalCost");
              onChange(value);
            }}
            keyboardType="decimal-pad"
            placeholder={t("fuel.totalCostPlaceholder")}
            style={{ direction: "ltr" }}
            startElement={<Text>{currencySymbol}</Text>}
            error={errors?.totalCost?.message}
            help={isRTL ? numberToPersianWord(Number(totalCost)) : ""}
          />
        )}
      />

      <Controller
        control={control}
        name="fullTank"
        render={({ field: { value, onChange } }) => (
          <SwitchToggle
            label={t("fuel.fullTank")}
            value={value ?? false}
            onValueChange={(value) => onChange(value)}
            description={t("fuel.explanationOfAverageFuelConsumption")}
          />
        )}
      />

      <Controller
        control={control}
        name="station"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label={t("fuel.station")}
            value={value?.toString() ?? ""}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t("fuel.stationPlaceHolder")}
          />
        )}
      />

      <Controller
        control={control}
        name="note"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label={t("fuel.note")}
            value={value ?? ""}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t("fuel.notePlaceholder")}
            multiline
            style={{
              height: 80,
              textAlignVertical: "top",
              paddingTop: 12,
            }}
          />
        )}
      />

      <View style={GlobalStyles.buttonColumn}>
        <Button
          title={id ? t("common.update") : t("common.save")}
          onPress={handleSubmit(handleSave)}
          loading={isPendingUpdate || isPendingCreate}
          style={{ flex: 1 }}
        />
        {isEditMode && (
          <FuelDeletionModal editingId={id} onConfirm={() => handleClose()} />
        )}
      </View>

      <View style={{ height: 160 }} />
    </KeyboardAwareScrollView>
  );
}
