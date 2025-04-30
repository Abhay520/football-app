export const calculateVariancePercentage = (data : number[]) : number => {
    const meanValue = data.reduce((sum, element) => sum + element, 0) / data.length;
    const sumOfDeviations = data.reduce((sum, element) => sum + Math.pow(element - meanValue, 2), 0);
    const variance = sumOfDeviations / (data.length - 1);
    return Number((variance / meanValue * 100).toFixed(2));
}

export const calculateMean = (data : number[]) : number => {
    const meanValue = data.reduce((sum, element) => sum + element, 0) / data.length;
    return Number((meanValue).toFixed(2));
}
