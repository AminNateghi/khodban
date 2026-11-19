import { useEffect, useState } from "react";
import { useGetProfile } from "@/repositories/profile-repository";
import type { LanguageType } from "@/types/interfaces";
import {
  getTranslation,
  getTranslationString,
  type TranslationKey,
} from "./translation";
import {
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_DISTANCE_UNIT,
  DEFAULT_FUEL_UNIT,
} from "@/constants";
import { useActiveVehicle } from "@/repositories/active-vehicle";

export type { TranslationDictionary, TranslationKey } from "./translation";
export { getTranslation } from "./translation";

export const useTranslation = () => {
  const { data } = useGetProfile();
  const { data: activeVehicle } = useActiveVehicle();
  const [language, setLanguage] = useState<LanguageType>("fa");

  useEffect(() => {
    if (data) {
      setLanguage(data.language ?? "fa");
    }
  }, [data]);

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  // dynamic string keys
  const tString = (key: string): string => {
    return getTranslationString(language, key);
  };

  const isRTL = t("app.rtl") === "true";
  const distanceUnit = tString(
    `distanceUnit.${activeVehicle?.distanceUnit ?? DEFAULT_DISTANCE_UNIT}`,
  );
  const currencySymbol = tString(
    `currencySymbol.${activeVehicle?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL}`,
  );
  const fuelUnit = tString(
    `fuelUnit.${activeVehicle?.fuelUnit ?? DEFAULT_FUEL_UNIT}`,
  );

  return { t, tString, isRTL, distanceUnit, currencySymbol, fuelUnit };
};
