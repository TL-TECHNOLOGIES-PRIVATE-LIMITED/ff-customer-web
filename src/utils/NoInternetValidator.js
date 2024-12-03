export function ValidateNoInternet(error) {
    const regex = /Failed to fetch/g;
    if (regex.test(error?.message)) return true;
};