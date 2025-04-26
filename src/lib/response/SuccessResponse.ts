class SuccessResponse {
  metadata?: {
    statusCode?: number;
    message?: string;
  };
  data?: {
    responseData: any;
  };
  constructor({
    metadata = { statusCode: 200, message: "Success" },
    data = { responseData: null },
  }: {
    metadata?: { statusCode: number; message: string };
    data?: { responseData: any };
  }) {
    this.metadata = metadata;
    this.data = data;
  }
}
export default SuccessResponse;
