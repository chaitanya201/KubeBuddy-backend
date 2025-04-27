import ErrorResponse from "../response/ErrorResponse";

class AppError extends ErrorResponse {
  constructor({
    metadata = { statusCode: 500, message: "Internal Server Error" },
    data = { responseData: null },
  }: {
    data?: ErrorResponse["data"];
    metadata?: ErrorResponse["metadata"];
  }) {
    super({ data, metadata });
  }
}

export default AppError;
