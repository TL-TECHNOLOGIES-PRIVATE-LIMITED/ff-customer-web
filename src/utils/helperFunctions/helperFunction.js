export const setPaymentMethod = (formData, paymentMethod) => {
    switch (paymentMethod.toLowerCase()) {
        case 'razorpay':
            formData.append("payment_method", "Razorpay")
            break;
        case 'stripe':
            formData.append("payment_method", "Stripe")
            break;
        case 'paystack':
        case 'paypal':
        case 'cashfree':
        case 'paytabs':
        case 'midtrans':
        case 'phonepe':
            formData.append('payment_method', paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1));
            formData.append('request_from', 'website');
            break;

    }
}