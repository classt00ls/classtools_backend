import { MultiLanguageResponse } from "@Shared/Domain/Types/MultiLanguageResponse";

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
    extractProsAndCons(content: string): Promise<MultiLanguageResponse<ProsAndConsResponse>>;
    extractRatings(content: string): Promise<MultiLanguageResponse<RatingsResponse>>;
    extractVideoUrl(content: string): Promise<string>;
    extractDescription(content: string): Promise<MultiLanguageResponse<{ analysis: string }>>;
    extractExcerpt(content: string): Promise<MultiLanguageResponse<{ analysis: string }>>;
    extractFeatures(content: string): Promise<MultiLanguageResponse<{ analysis: string }>>;
} 