type MultiLanguageResponse<T> = {
    es: T;
    en: T;
};

type ProsAndConsResponse = {
    analysis: string,
    structuredData: {
        pros: string[],
        cons: string[]
    }
};

type RatingsResponse = {
    analysis: string,
    structuredData: {
        ratings: Array<{
            category: string,
            score: number,
            description: string
        }>
    }
};

export interface ToolParamsExtractor {
    extractProsAndCons(html: string): Promise<MultiLanguageResponse<ProsAndConsResponse>>;
    extractVideoUrl(html: string): Promise<string>;
    extractRatings(html: string): Promise<MultiLanguageResponse<RatingsResponse>>;
} 