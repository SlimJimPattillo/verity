import { useState, useEffect, useCallback } from "react";
import { Sector } from "@/lib/sectorData";

interface OnboardingState {
  isComplete: boolean;
  selectedSector: Sector | null;
  userName: string | null;
  completedSteps: {
    sectorSelected: boolean;
    logoUploaded: boolean;
    reportCreated: boolean;
    grantAnswerGenerated: boolean;
  };
}

const STORAGE_KEY = "verity-onboarding";

const defaultState: OnboardingState = {
  isComplete: false,
  selectedSector: null,
  userName: null,
  completedSteps: {
    sectorSelected: false,
    logoUploaded: false,
    reportCreated: false,
    grantAnswerGenerated: false,
  },
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setUserName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      userName: name,
    }));
  }, []);

  const selectSector = useCallback((sector: Sector) => {
    setState((prev) => ({
      ...prev,
      selectedSector: sector,
      completedSteps: {
        ...prev.completedSteps,
        sectorSelected: true,
      },
    }));
  }, []);

  const completeStep = useCallback((step: keyof OnboardingState["completedSteps"]) => {
    setState((prev) => ({
      ...prev,
      completedSteps: {
        ...prev.completedSteps,
        [step]: true,
      },
    }));
  }, []);

  const dismissOnboarding = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isComplete: true,
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(defaultState);
  }, []);

  const progressPercent = Math.round(
    (Object.values(state.completedSteps).filter(Boolean).length / 4) * 100
  );

  const showWelcomeModal = !state.completedSteps.sectorSelected;

  return {
    ...state,
    showWelcomeModal,
    progressPercent,
    setUserName,
    selectSector,
    completeStep,
    dismissOnboarding,
    resetOnboarding,
  };
}
