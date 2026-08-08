export interface IPayment {
  requestId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
}