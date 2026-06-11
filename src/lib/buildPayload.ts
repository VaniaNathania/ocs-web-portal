export const buildPayload = (data: any) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => {
      return value !== undefined && value !== null && value !== "";
    })
  );
};
