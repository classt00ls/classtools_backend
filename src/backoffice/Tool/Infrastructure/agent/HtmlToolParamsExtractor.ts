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

            CRITICAL REQUIREMENTS:
            1. You MUST provide TWO complete analyses: one in Spanish and one in English
            2. Both analyses MUST follow the EXACT same structure
            3. Both analyses MUST be clearly separated by the markers "SPANISH VERSION:" and "ENGLISH VERSION:"
            4. If you cannot provide BOTH versions, throw an error
            5. The response is not complete until BOTH versions are provided

            FORMATTING RULES:
            1. NEVER use asterisks (*) or any other symbols for lists
            2. ALWAYS use proper HTML tags
            3. Each point MUST be wrapped in <li> tags inside a <ul>
            4. Use <strong> tags for emphasis
            5. Follow the exact HTML structure shown below

            Your response MUST contain these TWO sections with this EXACT format:

            SPANISH VERSION:
            <h2>Análisis de Ventajas y Desventajas de [Tool Name]</h2>

            <h3>Ventajas (Pros)</h3>
            <ul>
                <li><strong>Integración con IA</strong>: descripción detallada</li>
                <li><strong>Facilidad de uso</strong>: descripción detallada</li>
            </ul>

            <h3>Desventajas (Cons)</h3>
            <ul>
                <li><strong>Limitaciones técnicas</strong>: descripción detallada</li>
                <li><strong>Costos</strong>: descripción detallada</li>
            </ul>

            <h3>Conclusión</h3>
            <p>Breve conclusión sobre la herramienta.</p>

            ENGLISH VERSION:
            <h2>Pros and Cons Analysis of [Tool Name]</h2>

            <h3>Advantages (Pros)</h3>
            <ul>
                <li><strong>AI Integration</strong>: detailed description</li>
                <li><strong>Ease of use</strong>: detailed description</li>
            </ul>

            <h3>Disadvantages (Cons)</h3>
            <ul>
                <li><strong>Technical limitations</strong>: detailed description</li>
                <li><strong>Costs</strong>: detailed description</li>
            </ul>

            <h3>Conclusion</h3>
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
                        "Integración con IA",
                        "Facilidad de uso",
                        ...
                    ],
                    "cons": [
                        "Limitaciones técnicas",
                        "Costos",
                        ...
                    ]
                },
                "en": {
                    "pros": [
                        "AI Integration",
                        "Ease of use",
                        ...
                    ],
                    "cons": [
                        "Technical limitations",
                        "Costs",
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
        const content = analysisResponse.content;
        let spanishAnalysis = '';
        let englishAnalysis = '';

        if (content.includes('SPANISH VERSION:') && content.includes('ENGLISH VERSION:')) {
            const parts = content.split('ENGLISH VERSION:');
            spanishAnalysis = parts[0].replace('SPANISH VERSION:', '').trim();
            englishAnalysis = parts[1].trim();
        } else {
            this.logger.error('El modelo no devolvió ambas versiones del análisis de pros y contras');
            throw new Error('El modelo debe proporcionar ambas versiones del análisis de pros y contras');
        }

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

            IMPORTANT: You must provide BOTH versions. If you only provide one, it's considered an error.
            The response should follow this format for BOTH languages:

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

        // Separar el análisis en español e inglés
        const content = analysisResponse.content;
        let spanishAnalysis = '';
        let englishAnalysis = '';

        if (content.includes('SPANISH VERSION:') && content.includes('ENGLISH VERSION:')) {
            const parts = content.split('ENGLISH VERSION:');
            spanishAnalysis = parts[0].replace('SPANISH VERSION:', '').trim();
            englishAnalysis = parts[1].trim();
        } else {
            this.logger.error('El modelo no devolvió ambas versiones del análisis de ratings');
            throw new Error('El modelo debe proporcionar ambas versiones del análisis de ratings');
        }

        return {
            es: {
                analysis: spanishAnalysis,
                structuredData: { ratings: [] }
            },
            en: {
                analysis: englishAnalysis,
                structuredData: { ratings: [] }
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
            - Do not mention specific prices
            - Do NOT include any ratings, scores or numerical evaluations
            
            IMPORTANT: You must provide BOTH versions. If you only provide one, it's considered an error.
            Provide the description in both Spanish and English, clearly separated by markers:

            SPANISH VERSION:
            [Your Spanish description here]

            ENGLISH VERSION:
            [Your English description here]`;

        const analysisResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            new HumanMessage(html)
        ]);

        // Separar el análisis en español e inglés
        const content = analysisResponse.content;
        let spanishAnalysis = '';
        let englishAnalysis = '';

        if (content.includes('SPANISH VERSION:') && content.includes('ENGLISH VERSION:')) {
            const parts = content.split('ENGLISH VERSION:');
            spanishAnalysis = parts[0].replace('SPANISH VERSION:', '').trim();
            englishAnalysis = parts[1].trim();
        } else {
            this.logger.error('El modelo no devolvió ambas versiones del análisis');
            throw new Error('El modelo debe proporcionar ambas versiones del análisis');
        }

        return {
            es: { analysis: spanishAnalysis },
            en: { analysis: englishAnalysis }
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
            
            IMPORTANT: You must provide BOTH versions. If you only provide one, it's considered an error.
            Provide the summary in both Spanish and English, clearly separated by markers:
            
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
        const content = analysisResponse.content;
        let spanishAnalysis = '';
        let englishAnalysis = '';

        if (content.includes('SPANISH VERSION:') && content.includes('ENGLISH VERSION:')) {
            const parts = content.split('ENGLISH VERSION:');
            spanishAnalysis = parts[0].replace('SPANISH VERSION:', '').trim();
            englishAnalysis = parts[1].trim();
        } else {
            this.logger.error('El modelo no devolvió ambas versiones del resumen');
            throw new Error('El modelo debe proporcionar ambas versiones del resumen');
        }

        return {
            es: { analysis: spanishAnalysis },
            en: { analysis: englishAnalysis }
        };
    }

    async extractFeatures(html: string): Promise<MultiLanguageResponse<{ analysis: string }>> {
        const SYSTEM_TEMPLATE = `You are an expert web content analyst specialized in artificial intelligence (AI) products.
            Your task is to analyze a webpage and extract the key features of the AI tool.
            Look specifically for sections that list features, capabilities, or functionalities.
            You must provide the features in both Spanish and English.
            Format the features using HTML list items, like this:

            IMPORTANT: You must provide BOTH versions. If you only provide one, it's considered an error.
            The response should follow this format for BOTH languages:

            SPANISH VERSION:
            <h2>Características Principales de [Nombre de la Herramienta]</h2>
            <ul>
                <li><strong>Primera característica</strong>: descripción detallada</li>
                <li><strong>Segunda característica</strong>: descripción detallada</li>
                <li><strong>Tercera característica</strong>: descripción detallada</li>
            </ul>

            ENGLISH VERSION:
            <h2>Main Features of [Tool Name]</h2>
            <ul>
                <li><strong>First feature</strong>: detailed description</li>
                <li><strong>Second feature</strong>: detailed description</li>
                <li><strong>Third feature</strong>: detailed description</li>
            </ul>`;

        const analysisResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            new HumanMessage(html)
        ]);

        // Separar el análisis en español e inglés
        const content = analysisResponse.content;
        let spanishAnalysis = '';
        let englishAnalysis = '';

        if (content.includes('SPANISH VERSION:') && content.includes('ENGLISH VERSION:')) {
            const parts = content.split('ENGLISH VERSION:');
            spanishAnalysis = parts[0].replace('SPANISH VERSION:', '').trim();
            englishAnalysis = parts[1].trim();
        } else {
            this.logger.error('El modelo no devolvió ambas versiones de las características');
            throw new Error('El modelo debe proporcionar ambas versiones de las características');
        }

        return {
            es: { analysis: spanishAnalysis },
            en: { analysis: englishAnalysis }
        };
    }

    async extractHowToUse(html: string): Promise<MultiLanguageResponse<{
        analysis: string,
        structuredData: {
            steps: Array<{
                title: string,
                description: string
            }>
        }
    }>> {
        const SYSTEM_TEMPLATE = `You are an expert web content analyst specialized in artificial intelligence (AI) products.
            Your task is to analyze a webpage and extract or create a step-by-step guide on how to use the AI tool.
            Focus on providing clear, actionable steps that a user needs to follow to start using the tool effectively.

            CRITICAL REQUIREMENTS:
            1. You MUST provide TWO complete guides: one in Spanish and one in English
            2. Both guides MUST follow the EXACT same structure and steps
            3. Both guides MUST be clearly separated by the markers "SPANISH VERSION:" and "ENGLISH VERSION:"
            4. If you cannot provide BOTH versions, throw an error
            5. The response is not complete until BOTH versions are provided

            FORMATTING RULES:
            1. NEVER use asterisks (*) or any other symbols for lists
            2. ALWAYS use proper HTML tags
            3. Each step MUST be wrapped in <li> tags inside an <ol>
            4. Use <strong> tags for step titles
            5. Follow the exact HTML structure shown below

            Your response MUST contain these TWO sections with this EXACT format:

            SPANISH VERSION:
            <h2>Guía de Uso de [Nombre de la Herramienta]</h2>

            <h3>Pasos para Comenzar</h3>
            <ol>
                <li><strong>Primer paso</strong>: descripción detallada de qué hacer</li>
                <li><strong>Segundo paso</strong>: descripción detallada de qué hacer</li>
                <li><strong>Tercer paso</strong>: descripción detallada de qué hacer</li>
            </ol>

            <h3>Consejos Adicionales</h3>
            <p>Consejos útiles para obtener mejores resultados.</p>

            ENGLISH VERSION:
            <h2>How to Use [Tool Name]</h2>

            <h3>Getting Started Steps</h3>
            <ol>
                <li><strong>First step</strong>: detailed description of what to do</li>
                <li><strong>Second step</strong>: detailed description of what to do</li>
                <li><strong>Third step</strong>: detailed description of what to do</li>
            </ol>

            <h3>Additional Tips</h3>
            <p>Useful tips for getting better results.</p>`;

        const analysisResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            new HumanMessage(html)
        ]);

        const CATEGORIZATION_SYSTEM_TEMPLATE = `Your job is to extract structured information about the steps to use the AI tool from a webpage.
            You must provide the response in both Spanish and English.`;

        const CATEGORIZATION_HUMAN_TEMPLATE = `The following text contains step-by-step guides in both Spanish and English.
            Your task is to identify the steps and their descriptions from both versions.
            Provide your response as a JSON object with the following structure:

            {
                "es": {
                    "steps": [
                        {
                            "title": "Primer paso",
                            "description": "Descripción detallada"
                        },
                        {
                            "title": "Segundo paso",
                            "description": "Descripción detallada"
                        }
                    ]
                },
                "en": {
                    "steps": [
                        {
                            "title": "First step",
                            "description": "Detailed description"
                        },
                        {
                            "title": "Second step",
                            "description": "Detailed description"
                        }
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
                            steps: z.array(z.object({
                                title: z.string(),
                                description: z.string()
                            }))
                        }),
                        en: z.object({
                            steps: z.array(z.object({
                                title: z.string(),
                                description: z.string()
                            }))
                        })
                    })
                )
            }
        });

        const categorizationOutput = JSON.parse(categorizationResponse.content as string);

        // Separar el análisis en español e inglés
        const content = analysisResponse.content;
        let spanishAnalysis = '';
        let englishAnalysis = '';

        if (content.includes('SPANISH VERSION:') && content.includes('ENGLISH VERSION:')) {
            const parts = content.split('ENGLISH VERSION:');
            spanishAnalysis = parts[0].replace('SPANISH VERSION:', '').trim();
            englishAnalysis = parts[1].trim();
        } else {
            this.logger.error('El modelo no devolvió ambas versiones de la guía de uso');
            throw new Error('El modelo debe proporcionar ambas versiones de la guía de uso');
        }

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
} 