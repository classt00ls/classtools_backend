import { Injectable, Logger } from '@nestjs/common';
import { ChatTogetherModelProvider } from '@Shared/Infrastructure/IA/ChatTogetherModelProvider';
import { HumanMessage } from '@langchain/core/messages';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';
import { ToolParamsExtractor } from '../../Domain/ToolParamsExtractor';
import { MultiLanguageResponse } from '@Shared/Domain/Types/MultiLanguageResponse';

@Injectable()
export class HtmlToolParamsExtractor implements ToolParamsExtractor {
    private readonly logger = new Logger(HtmlToolParamsExtractor.name);
    private model;

    constructor(
        private readonly modelProvider: ChatTogetherModelProvider
    ) {
        this.model = modelProvider.provide();
    }

    async extractVideoUrl(html: string): Promise<string> {
        try {
            const SYSTEM_TEMPLATE =
                `You are an expert web content analyst. Your task is to analyze a webpage and extract the URL of a video if it is explicitly mentioned in the HTML content. 
            Focus specifically on identifying the first video URL and return it. Do not infer any information—extract only what is explicitly stated in the content.`;

            const analysisResponse = await this.model.invoke([
                {
                    role: "system",
                    content: SYSTEM_TEMPLATE,
                },
                new HumanMessage(html)
            ]);

            const VIDEO_CATEGORIZATION_SYSTEM_TEMPLATE =
                `Your job is to extract the URL of a video if it is present in the webpage content.`;

            const VIDEO_CATEGORIZATION_HUMAN_TEMPLATE =
                `The following text is extracted from a webpage containing video content.  
            Tu misión es extraer la url de un video que encuentres que hable acerca de la IA que explica el html que te envío (lo más probable es que tenga la etiqueta html de video).
            Debes responder usando este formato:

            {
                "video_url": "URL_of_the_video"
            }
            Es muy importante que el video sea un link a un video, y que hable sobre la IA.
            If no video URL is mentioned, return "No video found".  

            Here is the text:

            <text>
            ${analysisResponse.content}
            </text>`;

            const categorizationResponse = await this.model.invoke([
                {
                    role: "system",
                    content: VIDEO_CATEGORIZATION_SYSTEM_TEMPLATE,
                },
                {
                    role: "user",
                    content: VIDEO_CATEGORIZATION_HUMAN_TEMPLATE,
                }
            ], {
                response_format: {
                    type: "json_object",
                    schema: zodToJsonSchema(
                        z.object({
                            video_url: z.string(),
                        })
                    )
                }
            });

            const categorizationOutput = JSON.parse(categorizationResponse.content as string);
            return categorizationOutput.video_url || "No video found";

        } catch (error) {
            console.error('Error extracting video URL:', error);
            throw new Error('Failed to extract video URL');
        }
    }

    async extractProsAndCons(html: string): Promise<MultiLanguageResponse<{
        analysis: string,
        structuredData: {
            pros: string[],
            cons: string[]
        }
    }>> {
        const SYSTEM_TEMPLATE = `You are an expert web content analyst specialized in artificial intelligence (AI) products.
            Your task is to analyze a webpage and extract key information about the AI described.
            Focus specifically on identifying the explicitly mentioned advantages (pros) and disadvantages (cons) of this AI tool.
            You can infer information—extract, not only what is explicitly stated.
            You must provide the analysis in both Spanish and English.
            Format the pros and cons using HTML list items (<li>) instead of asterisks or numbers.
            The response should follow this format for BOTH languages:

            <h2>Análisis de Ventajas y Desventajas de [Tool Name]</h2>

            <h3>Ventajas (Pros)</h3>
            <ul>
                <li><strong>First advantage</strong>: description</li>
                <li><strong>Second advantage</strong>: description</li>
            </ul>

            <h3>Desventajas (Cons)</h3>
            <ul>
                <li><strong>First disadvantage</strong>: description</li>
                <li><strong>Second disadvantage</strong>: description</li>
            </ul>

            <h3>Conclusión</h3>
            <p>Brief conclusion about the tool.</p>`;

        const analysisResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            new HumanMessage(html)
        ]);

        const CATEGORIZATION_SYSTEM_TEMPLATE = `Your job is to extract structured information about the AI tool's advantages and disadvantages from a webpage.
            You must provide the response in both Spanish and English.`;

        const CATEGORIZATION_HUMAN_TEMPLATE = `The following text contains analyses in both Spanish and English.
            Your task is to identify the pros and cons from both versions.
            Provide your response as a JSON object with the following structure:

            {
                "es": {
                    "pros": [
                        "Primera ventaja",
                        "Segunda ventaja",
                        ...
                    ],
                    "cons": [
                        "Primera desventaja",
                        "Segunda desventaja",
                        ...
                    ]
                },
                "en": {
                    "pros": [
                        "First advantage",
                        "Second advantage",
                        ...
                    ],
                    "cons": [
                        "First disadvantage",
                        "Second disadvantage",
                        ...
                    ]
                }
            }

            Here is the text:

            <text>
            ${analysisResponse.content}
            </text>`;

        const categorizationResponse = await this.model.invoke([
            {
                role: "system",
                content: CATEGORIZATION_SYSTEM_TEMPLATE,
            },
            {
                role: "user",
                content: CATEGORIZATION_HUMAN_TEMPLATE,
            }
        ], {
            response_format: {
                type: "json_object",
                schema: zodToJsonSchema(
                    z.object({
                        es: z.object({
                            pros: z.array(z.string()),
                            cons: z.array(z.string())
                        }),
                        en: z.object({
                            pros: z.array(z.string()),
                            cons: z.array(z.string())
                        })
                    })
                )
            }
        });

        const categorizationOutput = JSON.parse(categorizationResponse.content as string);

        // Separar el análisis en español e inglés
        const [spanishAnalysis, englishAnalysis] = analysisResponse.content.split('\n\nENGLISH VERSION:\n\n');

        return {
            es: {
                analysis: spanishAnalysis,
                structuredData: categorizationOutput.es
            },
            en: {
                analysis: englishAnalysis,
                structuredData: categorizationOutput.en
            }
        };
    }

    async extractRatings(html: string): Promise<MultiLanguageResponse<{
        analysis: string,
        structuredData: {
            ratings: Array<{
                category: string,
                score: number,
                description: string
            }>
        }
    }>> {
        const SYSTEM_TEMPLATE = `You are an expert web content analyst specialized in artificial intelligence (AI) products.
            Your task is to analyze a webpage and extract the ratings or scores mentioned about the AI tool.
            Look specifically for numerical scores (e.g., 4.5/5, 9/10, 85%, etc.) and their associated categories.
            You can infer information from the context.
            You must provide the analysis in both Spanish and English.
            Format the ratings using this HTML format:

            SPANISH VERSION:
            <h2>Análisis de Puntuaciones de [Nombre de la Herramienta]</h2>

            <h3>Puntuaciones Detalladas</h3>
            <ul>
                <li><strong>Categoría</strong>: Puntuación/10 - Descripción</li>
                <li><strong>Otra Categoría</strong>: Puntuación/10 - Descripción</li>
            </ul>

            <h3>Conclusión</h3>
            <p>Breve conclusión sobre las puntuaciones de la herramienta.</p>

            ENGLISH VERSION:
            <h2>Rating Analysis of [Tool Name]</h2>

            <h3>Detailed Ratings</h3>
            <ul>
                <li><strong>Category</strong>: Score/10 - Description</li>
                <li><strong>Other Category</strong>: Score/10 - Description</li>
            </ul>

            <h3>Conclusion</h3>
            <p>Brief conclusion about the tool's ratings.</p>`;

        const analysisResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            new HumanMessage(html)
        ]);

        const CATEGORIZATION_SYSTEM_TEMPLATE = `Your job is to extract structured information about the AI tool's ratings from a webpage.
            You must provide the response in both Spanish and English.`;

        const CATEGORIZATION_HUMAN_TEMPLATE = `The following text contains rating analyses in both Spanish and English.
            Your task is to identify the categories evaluated and their scores.
            Provide your response as a JSON object with the following structure:

            {
                "es": {
                    "ratings": [
                        {
                            "category": "Nombre de la categoría",
                            "score": 8.5,
                            "description": "Descripción de la puntuación"
                        }
                    ]
                },
                "en": {
                    "ratings": [
                        {
                            "category": "Category name",
                            "score": 8.5,
                            "description": "Score description"
                        }
                    ]
                }
            }

            Important:
            - All scores should be normalized to a 0-10 scale
            - Convert percentages to the 0-10 scale
            - If no ratings are found, return empty arrays

            Here is the text:

            <text>
            ${analysisResponse.content}
            </text>`;

        const categorizationResponse = await this.model.invoke([
            {
                role: "system",
                content: CATEGORIZATION_SYSTEM_TEMPLATE,
            },
            {
                role: "user",
                content: CATEGORIZATION_HUMAN_TEMPLATE,
            }
        ], {
            response_format: {
                type: "json_object",
                schema: zodToJsonSchema(
                    z.object({
                        es: z.object({
                            ratings: z.array(z.object({
                                category: z.string(),
                                score: z.number(),
                                description: z.string()
                            }))
                        }),
                        en: z.object({
                            ratings: z.array(z.object({
                                category: z.string(),
                                score: z.number(),
                                description: z.string()
                            }))
                        })
                    })
                )
            }
        });

        const categorizationOutput = JSON.parse(categorizationResponse.content as string);

        // Separar el análisis en español e inglés
        const [spanishAnalysis, englishAnalysis] = analysisResponse.content.split('\n\nENGLISH VERSION:\n\n');

        return {
            es: {
                analysis: spanishAnalysis,
                structuredData: categorizationOutput.es
            },
            en: {
                analysis: englishAnalysis,
                structuredData: categorizationOutput.en
            }
        };
    }

    async extractDescription(html: string): Promise<MultiLanguageResponse<{ analysis: string }>> {
        const SYSTEM_TEMPLATE = `You are an expert web content analyst specialized in artificial intelligence (AI) products.
            Your task is to provide a detailed description of the AI tool based on the provided content.
            The description should:
            1. Explain in detail the main features and functionalities
            2. Mention the most relevant use cases
            3. Highlight the AI technologies or models used
            4. Include information about important integrations or compatibilities
            5. Mention any relevant technical limitations or requirements
            
            Format:
            - Write in a professional and technical tone
            - Use well-structured paragraphs
            - Keep an approximate length of 200-300 words
            - Do not use bullet points or lists
            - Do not mention specific prices`;

        const analysisResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            new HumanMessage(html)
        ]);

        // Separar el análisis en español e inglés
        const [spanishAnalysis, englishAnalysis] = analysisResponse.content.split('\n\nENGLISH VERSION:\n\n');

        return {
            es: { analysis: spanishAnalysis || '' },
            en: { analysis: englishAnalysis || '' }
        };
    }

    async extractExcerpt(html: string): Promise<MultiLanguageResponse<{ analysis: string }>> {
        const SYSTEM_TEMPLATE = `You are an expert web content analyst specialized in artificial intelligence (AI) products.
            Your task is to create a concise and attractive summary of the AI tool based on the provided content.
            The summary should:
            1. Capture the essence and main purpose of the tool
            2. Highlight the most important benefit or key differentiator
            3. Be clear and direct
            
            Format:
            - Maximum 50 words
            - Persuasive but professional tone
            - Single sentence or short paragraph
            - No complex technical terms
            - Do not mention prices
            
            Provide the summary in both Spanish and English, separated by:
            
            SPANISH VERSION:
            [Your Spanish summary here]
            
            ENGLISH VERSION:
            [Your English summary here]`;

        const analysisResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            new HumanMessage(html)
        ]);

        // Separar el análisis en español e inglés
        const [spanishAnalysis, englishAnalysis] = analysisResponse.content.split('\n\nENGLISH VERSION:\n\n');

        return {
            es: { analysis: spanishAnalysis || '' },
            en: { analysis: englishAnalysis || '' }
        };
    }
} 