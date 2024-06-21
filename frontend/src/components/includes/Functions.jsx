// paystack configuration finction
export const configPaystack = (email, amount, publicKey) => {
    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount, //Amount in USD
        publicKey: publicKey,
    };

    return config;
}




export const exchangeRateConverter = (currency, amount) => {
    // Retrieve the percentage and exchange rate from localStorage
    const percentage = localStorage.getItem("percentage");

    const exchangeRate = JSON.parse(localStorage.getItem("exchangeRate"));

    // Get the exchange rate for the specified currency
    const countryCurrencyRate = exchangeRate[currency];

    // Calculate the sell amount in local currency with percentage added
    const sellAmountInLocalCurrency = parseFloat(amount) * (parseFloat(percentage) / 100);
    const sellAmountWithPercentage = sellAmountInLocalCurrency + parseFloat(amount);

    // Convert the amount to USD
    const sellAmountUsd = sellAmountWithPercentage / countryCurrencyRate;

    // Log the intermediate values for debugging
    console.log(
        exchangeRate[currency],
        sellAmountUsd,
        countryCurrencyRate,
        percentage,
        sellAmountInLocalCurrency,
        amount
    );

    // Return the result formatted to 2 decimal places
    return sellAmountUsd.toFixed(2);
}


export const ProcessingFeeCalculation = (amount, currency, giftcardFee) => {
    const processingFeePercentage = localStorage.getItem("gpc");
    const PayStackCharginFees = 1.9;
    if (currency === "GHS") {

        let proccessingFeeAmount = 0;
        if (amount < 500) {

            proccessingFeeAmount = parseFloat(((processingFeePercentage / 100) * amount) + giftcardFee).toFixed(2)
        } else {
            proccessingFeeAmount = parseFloat(((processingFeePercentage / 100) * amount) - giftcardFee).toFixed(2)
        }
        // console.log(amount, currency, giftcardFee, proccessingFeeAmount, processingFeePercentage)
        return proccessingFeeAmount;

        // const processingFeeAmount = (amount * processingFeePercentage) / 100;
        // const PaymentFees = (amount * PayStackCharginFees) / 100;

        // const Fees = giftcardFee + PaymentFees
    }
}