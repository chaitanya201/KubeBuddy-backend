class ErrorResponse {
  metadata?: {
    statusCode: number;
    message: string;
  };
  data?: {
    responseData: any;
  };
  constructor({
    metadata = { statusCode: 500, message: "Internal Server Error" },
    data = { responseData: null },
  }: {
    metadata?: { statusCode: number; message: string };
    data?: { responseData: any };
  }) {
    this.metadata = metadata;
    this.data = data;
  }
}
export default ErrorResponse;
