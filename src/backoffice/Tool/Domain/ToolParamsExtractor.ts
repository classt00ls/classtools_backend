export interface ToolParamsExtractor {
    extractProsAndCons(html: string): Promise<{
        analysis: string,
        structuredData: {
            pros: string[],
            cons: string[]
        }
    }>;

    extractVideoUrl(html: string): Promise<string>;
} 