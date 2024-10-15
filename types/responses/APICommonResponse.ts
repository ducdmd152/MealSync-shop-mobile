export default interface APICommonResponse {
  isSuccess: boolean;
  isFailure: boolean;
  isWarning: boolean;
  error: {
    isClientError: boolean;
    isSystemError: boolean;
    code: string;
    message: string;
  };
}
