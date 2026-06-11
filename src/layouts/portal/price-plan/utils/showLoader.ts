export const shouldShowLoader = (
  selectedOfferVerId: number | null | undefined,
  dataPricePlanDetail: any
): boolean => {
  // Kalau user sudah pilih → tidak perlu loader
  if (selectedOfferVerId) return false;

  const offerVerId = dataPricePlanDetail?.offerVerId;

  // Kalau ada offerVerId dan bukan array kosong → loader
  if (offerVerId && (!Array.isArray(offerVerId) || offerVerId.length > 0)) {
    return true;
  }

  // Kalau array kosong → tidak loader
  return false;
};
