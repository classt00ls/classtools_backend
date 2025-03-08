// import { DistanceStrategy, PGVectorStore } from "@langchain/community/vectorstores/pgvector";
// import { OllamaEmbeddings } from "@langchain/ollama";
// import { Injectable } from "@nestjs/common";
// import { OnEvent } from "@nestjs/event-emitter";
// import { ToolCreatedEvent } from "@Backoffice/Tool/Domain/ToolCreatedEvent";
// import { PoolConfig } from "pg";
// import { Document } from "@langchain/core/documents";
// import { Annotation, MessagesAnnotation, NodeInterrupt, StateGraph } from "@langchain/langgraph";
// import { ChatTogetherModelProvider } from "src/discover/Agent/Infrastructure/ChatTogetherModelProvider";
// import { HumanMessage } from "@langchain/core/messages";
// import zodToJsonSchema from "zod-to-json-schema";
// import { z } from "zod";

// @Injectable()
// export class ToolCreatedListener {

//   StateAnnotation;

//     model;

//     event;

//     constructor(
//         private modelProvider: ChatTogetherModelProvider
//     ) { 
//         this.StateAnnotation = Annotation.Root({
//             ...MessagesAnnotation.spec,
//             nextRepresentative: Annotation<string>,
//             refundAuthorized: Annotation<boolean>,
//         });

//         this.model = modelProvider.provide();
//     }

//   @OnEvent('backoffice.tool.created', { async: true }) 
//   async handleToolCreatedEvent(event: ToolCreatedEvent) {

//   //   const vectorStore = await PGVectorStore.initialize(
//   //     new OllamaEmbeddings({
//   //       model: "nomic-embed-text",
//   //       baseUrl: "http://localhost:11434",
//   //     }),
//   //     {
//   //       postgresConnectionOptions: {
//   //         type: "postgres",
//   //         host: "localhost",
//   //         port: 5431,
//   //         user: "classtools",
//   //         password: "classtools",
//   //         database: "classtools",
//   //       } as PoolConfig,
//   //       tableName: "classtools.posts",
//   //       columns: {
//   //         idColumnName: "id",
//   //         // Con esto se generará en embedding
//   //         contentColumnName: "content",
//   //         // Esta columna la crea langchain
//   //         metadataColumnName: "metadata",
//   //         // El vector de busqueda
//   //         vectorColumnName: "embedding",
//   //       },
//   //       distanceStrategy: "cosine" as DistanceStrategy,
//   //     },
//   //   );


//   //   console.log('Guai !!   ja tenim: ' + event.name);

//   //   const document = await this.getDocument(event);

// 	// await vectorStore.addDocuments([document]);
// 	// await vectorStore.end();
  
//   const response = await this.respond(event.html);
//   console.log(response);

//   }


//   private async getDocument(event) {
    
//     this.event = event;

//     const content = `
// Descripción
// ---------------
// ${event.description}

// Precio del curso
// ---------------
// ${event.price}

// Categorias del curso
// ---------------
// ${event.tags}

// La pagina
// ---------------
// ${event.html}
// `.trim();
	
// const url = event.url;

// 		const document = new Document({
// 			id: event.id, // uuid
// 			pageContent: content,
// 			metadata: { url },
// 		});

//     return document;
//   }


//   private async respond ($message: string) {

//     let builder = new StateGraph(this.StateAnnotation)
//         // .addNode("initial_support", this.initialSupport.bind(this))
//         // .addNode("billing_support", this.billingSupport.bind(this))
//         .addNode("event_extractor", this.event_extractor.bind(this))
//         // .addNode("handle_refund", this.handleRefund.bind(this))
//         .addEdge("__start__", "event_extractor");

//     // builder = builder.addConditionalEdges("initial_support", async (state: typeof this.StateAnnotation.State) => {
//     //     if (state.nextRepresentative.includes("BILLING")) {
//     //         return "billing";
//     //     } else if (state.nextRepresentative.includes("TECHNICAL")) {
//     //         return "technical";
//     //     } else {
//     //         return "conversational";
//     //     }
//     //     }, {
//     //     billing: "billing_support",
//     //     technical: "technical_support",
//     //     conversational: "__end__",
//     // });

//     builder = builder.addEdge("event_extractor", "__end__")

//     // builder = builder.addConditionalEdges("billing_support", async (state) => {
//     //     if (state.nextRepresentative.includes("REFUND")) {
//     //       return "refund";
//     //     } else {
//     //       return "__end__";
//     //     }
//     //   }, {
//     //     refund: "handle_refund",
//     //     __end__: "__end__",
//     //   })

//     // builder = builder.addEdge("handle_refund", "__end__");

//     // const checkpointer = new MemorySaver();

//     const graph = builder.compile({});

//     const finalState = await graph.invoke({
//         messages: [new HumanMessage($message)],
//       });
    
//       return finalState.messages[finalState.messages.length - 1].content;
// }


// private async initialSupport (state: typeof this.StateAnnotation.State) {
//     const SYSTEM_TEMPLATE =
//       `You are frontline support staff for Classtools, a company that provide for AI services.
//   Be concise in your responses.
//   You can chat with customers and help them with basic questions, but if the customer is having a billing or technical problem,
//   do not try to answer the question directly or gather information.
//   Instead, immediately transfer them to the billing or technical team by asking the user to hold for a moment.
//   Otherwise, just respond conversationally.`;

//     const supportResponse = await this.model.invoke([
//       { role: "system", content: SYSTEM_TEMPLATE },
//       ...state.messages,
//     ]);
    
//     const CATEGORIZATION_SYSTEM_TEMPLATE = `You are an expert customer support routing system.
//   Your job is to detect whether a customer support representative is routing a user to a billing team or a technical team, or if they are just responding conversationally.`;
    

//   const CATEGORIZATION_HUMAN_TEMPLATE =
//       `The previous conversation is an interaction between a customer support representative and a user.
//   Extract whether the representative is routing the user to a billing or technical team, or whether they are just responding conversationally.
//   Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
  
//   If they want to route the user to the billing team, respond only with the word "BILLING".
//   If they want to route the user to the technical team, respond only with the word "TECHNICAL".
//   Otherwise, respond only with the word "RESPOND".`;


//     const categorizationResponse = await this.model.invoke([{
//       role: "system",
//       content: CATEGORIZATION_SYSTEM_TEMPLATE,
//     },
//     ...state.messages,
//     {
//       role: "user",
//       content: CATEGORIZATION_HUMAN_TEMPLATE,
//     }],
//     {
//       response_format: {
//         type: "json_object",
//         schema: zodToJsonSchema(
//           z.object({
//             nextRepresentative: z.enum(["BILLING", "TECHNICAL", "RESPOND"]),
//           })
//         )
//       }
//     });
    
//     const categorizationOutput = JSON.parse(categorizationResponse.content as string);
    
//     return { messages: [supportResponse], nextRepresentative: categorizationOutput.nextRepresentative };
//   };


//   private async event_tractor(state: typeof this.StateAnnotation.State){
//     const SYSTEM_TEMPLATE =
//       `You are a great expert in all the artificial intelligence tools that exist. You work for a company called Classtools that work with AI tools.
//   Help the user to the best of your ability, but be concise in your responses.`;
  
//     let trimmedHistory = state.messages;
    
//     if (trimmedHistory.at(-1).getType() === "ai") {
//       trimmedHistory = trimmedHistory.slice(0, -1);
//     }
  
//     const response = await this.model.invoke([
//       {
//         role: "system",
//         content: SYSTEM_TEMPLATE,
//       },
//       ...trimmedHistory,
//     ]);
  
//     return {
//       messages: response,
//     };
//   };



//   private async event_extractor(state) {
    
//     const SYSTEM_TEMPLATE =
//         `You are an expert web content analyst specialized in artificial intelligence (AI) products.
//     Your task is to analyze a webpage and extract key information about the AI described.
//     Focus specifically on identifying the explicitly mentioned advantages (pros) and disadvantages (cons) of this AI tool.
//     You can infer information—extract, not only what is explicitly stated.
//     The response must be in spanish.
//     Format the pros and cons using HTML list items (<li>) instead of asterisks or numbers.
//     The response should follow this format:

//     <h2>Análisis de Ventajas y Desventajas de [Tool Name]</h2>

//     <h3>Ventajas (Pros)</h3>
//     <ul>
//         <li><strong>First advantage</strong>: description</li>
//         <li><strong>Second advantage</strong>: description</li>
//     </ul>

//     <h3>Desventajas (Cons)</h3>
//     <ul>
//         <li><strong>First disadvantage</strong>: description</li>
//         <li><strong>Second disadvantage</strong>: description</li>
//     </ul>

//     <h3>Conclusión</h3>
//     <p>Brief conclusion about the tool.</p>`;    
    
//     let trimmedHistory = state.messages;
    
//     if (trimmedHistory.at(-1).getType() === "ai") {
//         trimmedHistory = trimmedHistory.slice(0, -1);
//     }
//     const CATEGORIZATION_SYSTEM_TEMPLATE =
//         `Your job is to extract structured information about the AI tool's advantages and disadvantages from a webpage.`;  

    
//     const analysisResponse = await this.model.invoke([
//         {
//             role: "system",
//             content: SYSTEM_TEMPLATE,
//         },
//         ...trimmedHistory,
//     ]);

    

//     const CATEGORIZATION_HUMAN_TEMPLATE =
//         `The following text is extracted from a webpage describing an artificial intelligence (AI) tool.  
//     Your task is to identify the pros and cons explicitly stated in the content.  
//     Provide your response as a JSON object with the following structure:  

//     {
//         "pros": [
//             "First explicitly stated pro",
//             "Second explicitly stated pro",
//             ...
//         ],
//         "cons": [
//             "First explicitly stated con",
//             "Second explicitly stated con",
//             ...
//         ]
//     }

//     If no pros or cons are mentioned, return an empty list for that category.  
//     Do not infer information—extract only what is explicitly stated in the content. 
    
//     It's very very important that the response are in spanish.

//     Here is the text:  

//     <text>
//     ${analysisResponse.content}
//     </text>.`;

//     const categorizationResponse = await this.model.invoke([
//         {
//             role: "system",
//             content: CATEGORIZATION_SYSTEM_TEMPLATE,
//         },
//         {
//             role: "user",
//             content: CATEGORIZATION_HUMAN_TEMPLATE,
//         }
//     ], {
//         response_format: {
//             type: "json_object",
//             schema: zodToJsonSchema(
//                 z.object({
//                     pros: z.array(z.string()),
//                     cons: z.array(z.string()),
//                 })
//             )
//         }
//     });

//     const categorizationOutput = JSON.parse(categorizationResponse.content as string);

//     return {
//         messages: analysisResponse,
//         extractedData: categorizationOutput,
//     };
// };

// private async video_extractor(state) {
//   try {
//       const SYSTEM_TEMPLATE =
//           `You are an expert web content analyst. Your task is to analyze a webpage and extract the URL of a video if it is explicitly mentioned in the HTML content. 
//       Focus specifically on identifying the first video URL and return it. Do not infer any information—extract only what is explicitly stated in the content.`;

//       let trimmedHistory = state.messages;

//       if (trimmedHistory.at(-1).getType() === "ai") {
//           trimmedHistory = trimmedHistory.slice(0, -1);
//       }

//       const VIDEO_CATEGORIZATION_SYSTEM_TEMPLATE =
//           `Your job is to extract the URL of a video if it is present in the webpage content.`;

//       const analysisResponse = await this.model.invoke([
//           {
//               role: "system",
//               content: SYSTEM_TEMPLATE,
//           },
//           ...trimmedHistory,
//       ]);

//       const VIDEO_CATEGORIZATION_HUMAN_TEMPLATE =
//           `The following text is extracted from a webpage containing video content.  
//       Tu mision es extraer la url de un video que encuentres que hable acerca de la IA que explica el html que te envio ( lo mas probable es que tenga la etiqueta html de video) ,
//       Debes responder usando este formato:

//       {
//           "video_url": "URL_of_the_video"
//       }
//       Es muy importante que el video sea un link a un video, y que hable sobre la IA
//       If no video URL is mentioned, return "No video found".  

//       Here is the text:

//       <text>
//       ${analysisResponse.content}
//       </text>.`;

//       const categorizationResponse = await this.model.invoke([
//           {
//               role: "system",
//               content: VIDEO_CATEGORIZATION_SYSTEM_TEMPLATE,
//           },
//           {
//               role: "user",
//               content: VIDEO_CATEGORIZATION_HUMAN_TEMPLATE,
//           }
//       ], {
//           response_format: {
//               type: "json_object",
//               schema: zodToJsonSchema(
//                   z.object({
//                       video_url: z.string().optional(),
//                   })
//               )
//           }
//       });

//       const categorizationOutput = JSON.parse(categorizationResponse.content as string);

//       if (categorizationOutput.video_url) {
//           return {
//               messages: analysisResponse,
//               videoUrl: categorizationOutput.video_url,
//           };
//       } else {
//           return {
//               messages: analysisResponse,
//               videoUrl: "No video found",
//           };
//       }

//   } catch (error) {
//       console.error('Error extracting video URL:', error);
//       throw new Error('Failed to extract video URL');
// //   }
// };


// private async handleRefund(state: typeof this.StateAnnotation.State) {
//     if (!state.refundAuthorized) {
//         console.log("--- HUMAN AUTHORIZATION REQUIRED FOR REFUND ---");
//         throw new NodeInterrupt("Human authorization required.")
//     }
//     return {
//         messages: {
//         role: "assistant",
//         content: "Refund processed!",
//         },
//     };
// };

// }