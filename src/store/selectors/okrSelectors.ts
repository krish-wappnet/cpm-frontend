import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';
import type { Okr, KeyResult, KeyResultUpdate } from '../../types/okr';
import { selectOKRs, selectCurrentOKR } from '../slices/okrSlice';

export const selectFilteredOKRs = createSelector(
  [selectOKRs, (state: RootState) => state.okrs.filters],
  (okrs: Okr[]) => {
    // Apply filters here
    return okrs;
  }
);

export const selectOKRWithKeyResults = createSelector(
  [selectCurrentOKR],
  (okr: Okr | null) => {
    if (!okr) return null;
    // Since keyResults is part of the Okr type, we can safely access it
    return okr;
  }
);

export const selectKeyResultById = (state: RootState, id: string): KeyResult | undefined => {
  return state.okrs.currentOKR?.keyResults?.find((kr: KeyResult) => kr.id === id);
};

export const selectKeyResultUpdates = (state: RootState, keyResultId: string): KeyResultUpdate[] => {
  return state.okrs.keyResultUpdates?.filter((update: KeyResultUpdate) => 
    update.keyResultId === keyResultId
  ) || [];
};
