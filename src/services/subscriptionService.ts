// src/services/subscriptionService.ts
export const validateSubscription = (plan: string, apiId: number): boolean => {
    // Logic to validate if the API can be assigned based on the user's subscription plan
    // For example:
    const essentialApis = [1, 2, 3];
    const advancedApis = [1, 2, 3, 4, 5];
    const ultimateApis = [1, 2, 3, 4, 5, 6, 7];

    if (plan === 'Essential' && essentialApis.includes(apiId)) return true;
    if (plan === 'Advanced' && advancedApis.includes(apiId)) return true;
    if (plan === 'Ultimate' && ultimateApis.includes(apiId)) return true;

    return false;
};
