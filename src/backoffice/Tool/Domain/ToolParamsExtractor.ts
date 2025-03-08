export interface ToolParamsExtractor {
    extractProsAndCons(html: string): Promise<{
        analysis: string,
        structuredData: {
            pros: string[],
            cons: string[]
        }
    }>;

    extractVideoUrl(html: string): Promise<string>;

    extractRatings(html: string): Promise<{
        analysis: string,
        structuredData: {
            ratings: Array<{
                category: string,
                score: number,
                description: string
            }>
        }
    }>;
} 