import { useEffect, useLayoutEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { View } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DatePicker } from "@/components/DatePicker";
import { Input } from "@/components/Input";
import { SelectPicker } from "@/components/SelectPicker";
import {
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_DISTANCE_UNIT,
  DEFAULT_FUEL_UNIT,
  GlobalStyles,
  ReportStyles,
} from "@/constants";
import { useTranslation } from "@/languages/useTranslation";
import {
  useCreateVehicle,
  useGetVehicle,
  useUpdateVehicle,
} from "@/repositories/vehicle-repository";
import {
  currencySymbolOptions,
  distanceUnitOptions,
  type FuelType,
  type VehicleDto,
  type VehicleType,
  fuelUnitOptions,
  vehicleFuelTypeOptions,
  vehicleTypeOptions,
} from "@/types/interfaces";
import { type VehicleFormData, vehicleSchema } from "@/types/vehicle-schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VehicleDeletionModal } from "@/components/forms/VehicleDeletionModal";
import { SwitchToggle } from "@/components/SwitchToggle";
import { Toast } from "@/components/CustomToast";
import { IconButton } from "@/components/IconButton";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react-native";
import { Text } from "@/components/Text";

const defaultValues: VehicleFormData = {
  customName: "",
  makeModel: undefined,
  year: undefined,
  purchaseDate: undefined,
  purchasePrice: undefined,
  purchaseOdometer: undefined,
  sold: false,
  soldDate: undefined,
  soldPrice: undefined,
  soldOdometer: undefined,
  type: undefined,
  fuelType: undefined,
  capacity: undefined,
  distanceUnit: DEFAULT_DISTANCE_UNIT,
  fuelUnit: DEFAULT_FUEL_UNIT,
  currencySymbol: DEFAULT_CURRENCY_SYMBOL,
};

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function VehicleFormScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [id] = useState<number>(Number(params.id));
  const navigation = useNavigation();
  const { t, isRTL, tString } = useTranslation();
  const isEditMode = !!id;

  const { mutate: updateVehicle, isPending: isPendingUpdate } =
    useUpdateVehicle(id);
  const { mutate: createVehicle, isPending: isPendingCreate } =
    useCreateVehicle();
  const { data } = useGetVehicle(isEditMode ? Number(id) : null);

  const schema = vehicleSchema(t);
  const {
    control,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? t("vehicles.updateTitle") : t("vehicles.createTitle"),
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
  }, [navigation, t, isEditMode, isRTL]);

  useEffect(() => {
    if (!id) {
      reset(defaultValues);
      return;
    }
  }, [id, reset]);

  useEffect(() => {
    if (!data || !id) {
      return;
    }

    reset({
      capacity: data.capacity?.toString() ?? "",
      customName: data.customName,
      fuelType: data.fuelType ?? undefined,
      makeModel: data.makeModel ?? "",
      purchaseDate: data.purchaseDate
        ? new Date(data.purchaseDate).toISOString()
        : undefined,
      purchaseOdometer: data.purchaseOdometer?.toString() ?? "",
      purchasePrice: data.purchasePrice?.toString() ?? "",
      sold: data.sold,
      soldDate: data.soldDate
        ? new Date(data.soldDate).toISOString()
        : undefined,
      soldPrice: data.soldPrice?.toString() ?? "",
      soldOdometer: data.soldOdometer?.toString() ?? "",
      type: data.type ?? undefined,
      year: data.year?.toString() ?? "",
      distanceUnit: data.distanceUnit ?? DEFAULT_DISTANCE_UNIT,
      fuelUnit: data.fuelUnit ?? DEFAULT_FUEL_UNIT,
      currencySymbol: data.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL,
    });
  }, [data, id, reset]);

  const handleResetForm = () => {
    reset(defaultValues);
  };

  const handleClose = () => {
    handleResetForm();
    router.back();
  };

  const handleSave = (formData: VehicleFormData) => {
    const vehicle: Omit<VehicleDto, "id"> = {
      capacity: optionalNumber(String(formData.capacity)),
      customName: formData.customName.trim(),
      currencySymbol: formData.currencySymbol,
      distanceUnit: formData.distanceUnit,
      fuelType: formData.fuelType as FuelType,
      fuelUnit: formData.fuelUnit,
      makeModel: formData.makeModel?.trim() ?? null,
      purchaseDate: formData.purchaseDate
        ? new Date(formData.purchaseDate)
        : null,
      purchaseOdometer: optionalNumber(String(formData.purchaseOdometer)),
      purchasePrice: optionalNumber(String(formData.purchasePrice)),
      sold: formData.sold,
      soldDate:
        formData.sold && formData.soldDate ? new Date(formData.soldDate) : null,
      soldPrice: formData.sold
        ? optionalNumber(String(formData.soldPrice))
        : null,
      soldOdometer: formData.sold
        ? optionalNumber(String(formData.soldOdometer))
        : null,
      type: (formData.type as VehicleType) ?? null,
      year: optionalNumber(String(formData.year)),
    };

    const callbacks = {
      onSuccess: handleClose,
      onError: () => Toast({ text: t("vehicles.saveFailed"), type: "error" }),
    };

    if (id) {
      updateVehicle(vehicle, callbacks);
    } else {
      createVehicle(vehicle, callbacks);
    }
  };

  const fuelType = watch("fuelType") as FuelType | undefined;
  const isSold = watch("sold");
  const currencySymbol = tString(`currencySymbol.${watch("currencySymbol")}`);

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
        name="customName"
        render={({ field: { value, onChange } }) => (
          <Input
            label={t("vehicles.customName")}
            value={value}
            onChangeText={onChange}
            autoCapitalize="words"
            error={errors.customName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field: { value, onChange } }) => (
          <SelectPicker
            label={t("vehicles.type")}
            value={value?.toString() ?? ""}
            options={vehicleTypeOptions(t)}
            onValueChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="makeModel"
        render={({ field: { value, onChange } }) => (
          <Input
            label={t("vehicles.makeModel")}
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="year"
        render={({ field: { value, onChange } }) => (
          <Input
            label={t("vehicles.year")}
            value={value?.toString() ?? ""}
            onChangeText={onChange}
            keyboardType="number-pad"
            style={{ direction: "ltr" }}
          />
        )}
      />

      <Controller
        control={control}
        name="purchaseDate"
        render={({ field: { value, onChange } }) => (
          <DatePicker
            label={t("vehicles.purchaseDate")}
            value={value ? new Date(value).toISOString() : null}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="purchasePrice"
        render={({ field: { value, onChange } }) => (
          <View style={{ flex: 1 }}>
            <Input
              label={t("vehicles.purchasePrice")}
              value={value?.toString() ?? ""}
              onChangeText={onChange}
              keyboardType="decimal-pad"
              startElement={<Text>{currencySymbol}</Text>}
              style={{ direction: "ltr" }}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="purchaseOdometer"
        render={({ field: { value, onChange } }) => (
          <Input
            label={t("vehicles.purchaseOdometer")}
            value={value?.toString() ?? ""}
            onChangeText={onChange}
            keyboardType="number-pad"
            style={{ direction: "ltr" }}
          />
        )}
      />

      <Controller
        control={control}
        name="sold"
        render={({ field: { value, onChange } }) => (
          <SwitchToggle
            label={t("vehicles.sold")}
            value={value}
            onValueChange={onChange}
          />
        )}
      />

      {isSold && (
        <>
          <Controller
            control={control}
            name="soldDate"
            render={({ field: { value, onChange } }) => (
              <DatePicker
                label={t("vehicles.soldDate")}
                value={value ? new Date(value).toISOString() : null}
                onChange={onChange}
                error={errors.soldDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="soldPrice"
            render={({ field: { value, onChange } }) => (
              <Input
                label={t("vehicles.soldPrice")}
                value={value?.toString() ?? ""}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                style={{ direction: "ltr" }}
                startElement={<Text>{currencySymbol}</Text>}
                error={errors.soldPrice?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="soldOdometer"
            render={({ field: { value, onChange } }) => (
              <Input
                label={t("vehicles.soldOdometer")}
                value={value?.toString() ?? ""}
                onChangeText={onChange}
                keyboardType="number-pad"
                style={{ direction: "ltr" }}
                error={errors.soldOdometer?.message}
              />
            )}
          />
        </>
      )}

      <View style={ReportStyles.row}>
        <Controller
          control={control}
          name="fuelType"
          render={({ field: { value, onChange } }) => (
            <View style={{ flex: 1 }}>
              <SelectPicker
                label={t("vehicles.fuelType")}
                value={value?.toString() ?? ""}
                options={vehicleFuelTypeOptions(t)}
                onValueChange={onChange}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="capacity"
          render={({ field: { value, onChange } }) => (
            <View style={{ flex: 1 }}>
              <Input
                label={
                  fuelType === "Electric"
                    ? t("vehicles.batteryCapacity")
                    : fuelType === "CNG/LPG"
                      ? t("vehicles.cngCapacity")
                      : t("vehicles.fuelCapacity")
                }
                value={value?.toString() ?? ""}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                style={{ direction: "ltr" }}
              />
            </View>
          )}
        />
      </View>

      <Card title={t("vehicles.settings")}>
        <Controller
          control={control}
          name="distanceUnit"
          render={({ field: { value, onChange } }) => (
            <SelectPicker
              label={t("settings.distanceUnit")}
              value={value}
              options={distanceUnitOptions(t)}
              onValueChange={onChange}
              error={errors.distanceUnit?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="fuelUnit"
          render={({ field: { value, onChange } }) => (
            <SelectPicker
              label={t("settings.fuelUnit")}
              value={value}
              options={fuelUnitOptions(t)}
              onValueChange={onChange}
              error={errors.fuelUnit?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="currencySymbol"
          render={({ field: { value, onChange } }) => (
            <SelectPicker
              label={t("settings.currencySymbol")}
              value={value}
              options={currencySymbolOptions(t)}
              onValueChange={onChange}
              error={errors.currencySymbol?.message}
            />
          )}
        />
      </Card>

      <View style={GlobalStyles.buttonColumn}>
        <Button
          title={id ? t("common.update") : t("common.save")}
          onPress={handleSubmit(handleSave)}
          loading={isPendingUpdate || isPendingCreate}
          style={{ flex: 1 }}
        />
        {isEditMode && (
          <VehicleDeletionModal
            editingId={id}
            onConfirm={() => handleClose()}
          />
        )}
      </View>

      <View style={{ height: 160 }} />
    </KeyboardAwareScrollView>
  );
}
