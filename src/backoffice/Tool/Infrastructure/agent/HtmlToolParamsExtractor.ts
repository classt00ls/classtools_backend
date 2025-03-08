import { Injectable } from '@nestjs/common';
import { ChatTogetherModelProvider } from '@Shared/Infrastructure/IA/ChatTogetherModelProvider';
import { HumanMessage } from '@langchain/core/messages';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';
import { ToolParamsExtractor } from '../../Domain/ToolParamsExtractor';

@Injectable()
export class HtmlToolParamsExtractor implements ToolParamsExtractor {
    private model;

    constructor(
        private modelProvider: ChatTogetherModelProvider
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

    async extractProsAndCons(html: string): Promise<{ analysis: string, structuredData: { pros: string[], cons: string[] } }> {
        const SYSTEM_TEMPLATE =
            `You are an expert web content analyst specialized in artificial intelligence (AI) products.
        Your task is to analyze a webpage and extract key information about the AI described.
        Focus specifically on identifying the explicitly mentioned advantages (pros) and disadvantages (cons) of this AI tool.
        You can infer information—extract, not only what is explicitly stated.
        The response must be in spanish.
        Format the pros and cons using HTML list items (<li>) instead of asterisks or numbers.
        The response should follow this format:

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

        const CATEGORIZATION_SYSTEM_TEMPLATE =
            `Your job is to extract structured information about the AI tool's advantages and disadvantages from a webpage.`;

        const CATEGORIZATION_HUMAN_TEMPLATE =
            `The following text is extracted from a webpage describing an artificial intelligence (AI) tool.  
        Your task is to identify the pros and cons explicitly stated in the content.  
        Provide your response as a JSON object with the following structure:  

        {
            "pros": [
                "First explicitly stated pro",
                "Second explicitly stated pro",
                ...
            ],
            "cons": [
                "First explicitly stated con",
                "Second explicitly stated con",
                ...
            ]
        }

        If no pros or cons are mentioned, return an empty list for that category.  
        Do not infer information—extract only what is explicitly stated in the content. 
        
        It's very very important that the response are in spanish.

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
                        pros: z.array(z.string()),
                        cons: z.array(z.string()),
                    })
                )
            }
        });

        const categorizationOutput = JSON.parse(categorizationResponse.content as string);

        return {
            analysis: analysisResponse.content,
            structuredData: categorizationOutput
        };
    }

    async extractRatings(html: string): Promise<{ analysis: string, structuredData: { ratings: Array<{ category: string, score: number, description: string }> } }> {
        const SYSTEM_TEMPLATE =
            `Eres un experto analista de contenido web especializado en productos de inteligencia artificial (IA).
            Tu tarea es analizar una página web y extraer las puntuaciones o calificaciones mencionadas sobre la herramienta de IA.
            Busca específicamente menciones de puntuaciones numéricas (por ejemplo: 4.5/5, 9/10, 85%, etc.) y sus categorías asociadas.
            Puedes inferir información a partir del contexto.
            La respuesta debe ser en español.
            Formatea las puntuaciones usando este formato HTML:

            <h2>Análisis de Puntuaciones de [Nombre de la Herramienta]</h2>

            <h3>Puntuaciones Detalladas</h3>
            <ul>
                <li><strong>Categoría</strong>: Puntuación/10 - Descripción</li>
                <li><strong>Otra Categoría</strong>: Puntuación/10 - Descripción</li>
            </ul>

            <h3>Conclusión</h3>
            <p>Breve conclusión sobre las puntuaciones de la herramienta.</p>`;

        const analysisResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            new HumanMessage(html)
        ]);

        const CATEGORIZATION_SYSTEM_TEMPLATE =
            `Tu trabajo es extraer información estructurada sobre las puntuaciones de la herramienta de IA de una página web.`;

        const CATEGORIZATION_HUMAN_TEMPLATE =
            `El siguiente texto contiene información sobre puntuaciones de una herramienta de IA.
            Tu tarea es identificar las categorías evaluadas y sus puntuaciones.
            Proporciona tu respuesta como un objeto JSON con la siguiente estructura:

            {
                "ratings": [
                    {
                        "category": "Nombre de la categoría",
                        "score": 8.5,
                        "description": "Descripción de la puntuación"
                    },
                    ...
                ]
            }

            Importante:
            - Todas las puntuaciones deben estar normalizadas a una escala de 0 a 10
            - Si encuentras porcentajes, conviértelos a la escala de 0-10
            - La respuesta debe estar en español
            - Si no hay puntuaciones, devuelve un array vacío

            Aquí está el texto:

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
                        ratings: z.array(z.object({
                            category: z.string(),
                            score: z.number(),
                            description: z.string()
                        }))
                    })
                )
            }
        });

        const categorizationOutput = JSON.parse(categorizationResponse.content as string);

        return {
            analysis: analysisResponse.content,
            structuredData: categorizationOutput
        };
    }
} 