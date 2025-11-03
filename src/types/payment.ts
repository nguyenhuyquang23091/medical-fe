export interface PaymentRequest {
    amount : string, 
    referenceId : string
}

export interface PaymentResponse {
    paymentUrl : string, 
    tnxRef : string,
    amount: string, 
    message : string, 
    status : string, 
}