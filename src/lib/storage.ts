import {
  CALIBRATION_STORAGE_KEY,
  HINTS_STORAGE_KEY,
  QUALITY_STORAGE_KEY
} from "@/lib/constants";
import type { CalibrationProfile, QualityMode } from "@/lib/types";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeValue(key: string) {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function loadCalibrationProfile() {
  return readJson<CalibrationProfile>(CALIBRATION_STORAGE_KEY);
}

export function saveCalibrationProfile(profile: CalibrationProfile) {
  return writeJson(CALIBRATION_STORAGE_KEY, profile);
}

export function clearCalibrationProfile() {
  return removeValue(CALIBRATION_STORAGE_KEY);
}

export function loadQualityMode() {
  return readJson<QualityMode>(QUALITY_STORAGE_KEY);
}

export function saveQualityMode(mode: QualityMode) {
  return writeJson(QUALITY_STORAGE_KEY, mode);
}

export function loadHideHintsPreference() {
  return readJson<boolean>(HINTS_STORAGE_KEY) ?? false;
}

export function saveHideHintsPreference(isHidden: boolean) {
  return writeJson(HINTS_STORAGE_KEY, isHidden);
}

export function isLocalStorageSupported() {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    const testKey = "__ar_hand_tracking_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
