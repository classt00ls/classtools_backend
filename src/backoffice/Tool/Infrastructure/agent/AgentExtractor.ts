// import { Injectable } from "@nestjs/common";
// import { Annotation, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
// import { ChatTogetherModelProvider } from "src/discover/Agent/Infrastructure/ChatTogetherModelProvider";
// import { HumanMessage } from "@langchain/core/messages";
// import zodToJsonSchema from "zod-to-json-schema";
// import { z } from "zod";

// @Injectable()
// export class AgentExtractor {

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
    
//   async extract(body: string, video: string) {

//     let builder = new StateGraph(this.StateAnnotation)
//         // .addNode("initial_support", this.initialSupport.bind(this))
//         // .addNode("billing_support", this.billingSupport.bind(this))
//         .addNode("event_extractor", this.pros_cons_extractor.bind(this))
//         .addNode("video_extractor", this.video_extractor.bind(this))
//         // .addNode("handle_refund", this.handleRefund.bind(this))
//         .addEdge("__start__", "event_extractor");
        

//     builder = builder.addEdge("video_extractor", "__end__")

//     const graph = builder.compile({});

//     const finalState = await graph.invoke({
//         messages: [new HumanMessage($message)],
//       });
    
//       return finalState.messages[finalState.messages.length - 1].content;
// }



//   private async pros_cons_extractor(state) {
    
//     const SYSTEM_TEMPLATE =
//         `You are an expert web content analyst specialized in artificial intelligence (AI) products.
//     Your task is to analyze a webpage and extract key information about the AI described.
//     Focus specifically on identifying the explicitly mentioned advantages (pros) and disadvantages (cons) of this AI tool.
//     You can infer information—extract, not only what is explicitly stated.
//     The response must be in spanish.`;    
    
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
//   }
// };


// }