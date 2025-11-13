export const AUTHENTICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
} as const;

export type AuthenticationStatus = (typeof AUTHENTICATION_STATUS)[keyof typeof AUTHENTICATION_STATUS];
