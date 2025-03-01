import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";

import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { NodeInterrupt } from "@langchain/langgraph";

import { StateGraph } from "@langchain/langgraph";

import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

// Esto significa que la asignación del siguiente representante (nextRepresentative) se hará dentro de los nodos en lugar de hacerlo dentro de una transición o "edge" del grafo.

// 📌 ¿Por qué?

// En LangGraph, cada nodo representa una operación lógica en el flujo de la IA.
// Si usamos un modelo de lenguaje (LLM) para tomar decisiones sobre la ruta en una edge (una transición entre nodos), 
// la salida podría ser no determinista debido a la naturaleza probabilística de los LLMs.
// Si queremos que el sistema pueda reanudar desde un punto de control (checkpoint) de manera consistente, es mejor que decisiones críticas, 
// como la asignación del próximo representante, se realicen dentro de los nodos, evitando el uso de LLMs en las transiciones.
// 🔹 Ejemplo de problema
// Si un LLM decide el siguiente representante en una edge, dos ejecuciones del mismo flujo con el mismo estado podrían dar resultados diferentes debido a la aleatoriedad inherente del modelo. Esto haría que la reanudación desde un checkpoint no siempre fuese la misma.

const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  nextRepresentative: Annotation<string>,
  refundAuthorized: Annotation<boolean>,
});

// {
//     messages: BaseMessage[],  // Manejo de mensajes en los nodos
//     nextRepresentative: string, // Nombre o ID del próximo representante
//     refundAuthorized: boolean // Indica si el reembolso está aprobado
//   }

// const model = new ChatOllama({
//     model: "meta-llama-3.1-8b-instruct",
//     temperature: 0.2,
//     baseUrl: "http://mi-servidor:puerto", // Cambia esto si Ollama no está en localhost
//   });

const model = new ChatTogetherAI({
  model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  temperature: 0,
  apiKey: "5bc0df79a9cf4312a9344efc2e149b6469201df90f1a9aa7b9629b6d40304a0d"
});

// 🔹 ¿Qué hace esto?
// Define el comportamiento del asistente virtual como un agente de soporte de primera línea con las siguientes reglas:

// Puede responder preguntas básicas.
// Si detecta un problema de facturación o técnico, NO responde directamente, sino que transfiere al usuario.
const initialSupport = async (state: typeof StateAnnotation.State) => {
    const SYSTEM_TEMPLATE =
      `You are frontline support staff for Classtools, a company that provide for AI services.
  Be concise in your responses.
  You can chat with customers and help them with basic questions, but if the customer is having a billing or technical problem,
  do not try to answer the question directly or gather information.
  Instead, immediately transfer them to the billing or technical team by asking the user to hold for a moment.
  Otherwise, just respond conversationally.`;


//   ¿Qué hace esto?
// Llama al modelo de lenguaje (LLM) pasándole el SYSTEM_TEMPLATE y el historial de mensajes (state.messages).
// Devuelve una respuesta generada por la IA basada en esas instrucciones.
// ==========================( model invoke )==========================================

    const supportResponse = await model.invoke([
      { role: "system", content: SYSTEM_TEMPLATE },
      ...state.messages,
    ]);

// ====================================================================
  
//     🔹 ¿Qué hace esto?
// Define otro agente especializado en clasificar la respuesta del soporte para determinar si se debe transferir o no al usuario.
    const CATEGORIZATION_SYSTEM_TEMPLATE = `You are an expert customer support routing system.
  Your job is to detect whether a customer support representative is routing a user to a billing team or a technical team, or if they are just responding conversationally.`;
    

//   ¿Qué hace esto?
//   Pide al modelo que analice la conversación y clasifique la respuesta en una de tres categorías:
//   "BILLING" → Si debe transferir al equipo de facturación.
//   "TECHNICAL" → Si debe transferir al equipo de soporte técnico.
//   "RESPOND" → Si puede manejar la respuesta sin transferir.

  const CATEGORIZATION_HUMAN_TEMPLATE =
      `The previous conversation is an interaction between a customer support representative and a user.
  Extract whether the representative is routing the user to a billing or technical team, or whether they are just responding conversationally.
  Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
  
  If they want to route the user to the billing team, respond only with the word "BILLING".
  If they want to route the user to the technical team, respond only with the word "TECHNICAL".
  Otherwise, respond only with the word "RESPOND".`;

//   🔹 ¿Qué hace esto?
// Llama nuevamente al modelo de lenguaje para determinar la categorización de la respuesta generada previamente.
// Especifica que la salida debe ser un JSON estructurado con nextRepresentative conteniendo "BILLING", "TECHNICAL" o "RESPOND".
  // ==========================( model invoke )==========================================

    const categorizationResponse = await model.invoke([{
      role: "system",
      content: CATEGORIZATION_SYSTEM_TEMPLATE,
    },
    ...state.messages,
    {
      role: "user",
      content: CATEGORIZATION_HUMAN_TEMPLATE,
    }],
    {
      response_format: {
        type: "json_object",
        schema: zodToJsonSchema(
          z.object({
            nextRepresentative: z.enum(["BILLING", "TECHNICAL", "RESPOND"]),
          })
        )
      }
    });

    // ====================================================================

    // Some chat models can return complex content, but Together will not
    const categorizationOutput = JSON.parse(categorizationResponse.content as string);
    
    // Will append the response message to the current interaction state
    return { messages: [supportResponse], nextRepresentative: categorizationOutput.nextRepresentative };
  };

  const technicalSupport = async (state: typeof StateAnnotation.State) => {
    const SYSTEM_TEMPLATE =
      `You are a great expert in all the artificial intelligence tools that exist. You work for a company called Classtools that work with AI tools.
  Help the user to the best of your ability, but be concise in your responses.`;
  
    let trimmedHistory = state.messages;
    // Make the user's question the most recent message in the history.
    // This helps small models stay focused.
    if (trimmedHistory.at(-1).getType() === "ai") {
      trimmedHistory = trimmedHistory.slice(0, -1);
    }
  
    const response = await model.invoke([
      {
        role: "system",
        content: SYSTEM_TEMPLATE,
      },
      ...trimmedHistory,
    ]);
  
    return {
      messages: response,
    };
  };


  const billingSupport = async (state) => {
    // 🔹 ¿Qué hace esto?
    
    // Define el rol del asistente como especialista en facturación.
    // Puede aprobar reembolsos, pero en lugar de procesarlos, transfiere al usuario a otro agente que tomará los datos necesarios.
    // No necesita pedir información adicional al usuario.
    
    const SYSTEM_TEMPLATE =
      `You are an expert billing support specialist for Classtools that work with AI tools.
    Help the user to the best of your ability, but be concise in your responses.
    You have the ability to authorize refunds, which you can do by transferring the user to another agent who will collect the required information.
    If you do, assume the other agent has all necessary information about the customer and their order.
    You do not need to ask the user for more information.`;
    
    
    let trimmedHistory = state.messages;
      // Make the user's question the most recent message in the history.
      // This helps small models stay focused.
      if (trimmedHistory.at(-1).getType() === "ai") {
        trimmedHistory = trimmedHistory.slice(0, -1);
      }
    
      const billingRepResponse = await model.invoke([
        {
          role: "system",
          content: SYSTEM_TEMPLATE,
        },
        ...trimmedHistory,
      ]);
      // ¿Qué hace esto?
      // Si el último mensaje en el historial es de la IA en lugar del usuario, se elimina.
      // Esto ayuda a los modelos pequeños a mantenerse enfocados en la pregunta del usuario.


      const CATEGORIZATION_SYSTEM_TEMPLATE =
        `Your job is to detect whether a billing support representative wants to refund the user.`;

//         🔹 ¿Qué hace esto?
// Define otro modelo de IA que clasificará la respuesta para ver si se aprueba un reembolso.

      const CATEGORIZATION_HUMAN_TEMPLATE =
        `The following text is a response from a customer support representative.
    Extract whether they want to refund the user or not.
    Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
    
    If they want to refund the user, respond only with the word "REFUND".
    Otherwise, respond only with the word "RESPOND".
    
    Here is the text:
    
    <text>
    ${billingRepResponse.content}
    </text>.`;

//     🔹 ¿Qué hace esto?

// Le pide a la IA que analice si el agente de facturación autorizó un reembolso o no.
// Si autorizó un reembolso, responde "REFUND", de lo contrario, "RESPOND".


      const categorizationResponse = await model.invoke([
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
              nextRepresentative: z.enum(["REFUND", "RESPOND"]),
            })
          )
        }
      });
      const categorizationOutput = JSON.parse(categorizationResponse.content as string);

      return {
        messages: billingRepResponse,
        nextRepresentative: categorizationOutput.nextRepresentative,
      };
    };




const handleRefund = async (state: typeof StateAnnotation.State) => {
  if (!state.refundAuthorized) {
    console.log("--- HUMAN AUTHORIZATION REQUIRED FOR REFUND ---");
    throw new NodeInterrupt("Human authorization required.")
  }
  return {
    messages: {
      role: "assistant",
      content: "Refund processed!",
    },
  };
};


let builder = new StateGraph(StateAnnotation)
  .addNode("initial_support", initialSupport)
  .addNode("billing_support", billingSupport)
  .addNode("technical_support", technicalSupport)
  .addNode("handle_refund", handleRefund)
  .addEdge("__start__", "initial_support");

  
//   StateGraph(StateAnnotation): Crea un grafo de estados, que se usa para modelar flujos de conversación.
// addNode(nombre, handler): Define los diferentes estados del chatbot.
// "initial_support": Estado inicial.
// "billing_support": Soporte de facturación.
// "technical_support": Soporte técnico.
// "handle_refund": Manejo de reembolsos.
// addEdge("__start__", "initial_support"): Define que el flujo comienza en initial_support.

  // Añadimos edge al builder
  builder = builder.addConditionalEdges("initial_support", async (state: typeof StateAnnotation.State) => {
    if (state.nextRepresentative.includes("BILLING")) {
      return "billing";
    } else if (state.nextRepresentative.includes("TECHNICAL")) {
      return "technical";
    } else {
      return "conversational";
    }
  }, {
    billing: "billing_support",
    technical: "technical_support",
    conversational: "__end__",
  });

// Aquí definimos cómo pasar de "initial_support" a otros estados en función de state.nextRepresentative:
// "billing" → Si state.nextRepresentative incluye "BILLING", se va a "billing_support".
// "technical" → Si incluye "TECHNICAL", se va a "technical_support".
// "conversational" → Si no coincide con ninguno, finaliza el flujo ("__end__").
  
// Let's continue. We add an edge making the technical support node always end, since it has no tools to call. 
// The billing support node uses a conditional edge since it can either call the refund tool or end.

// Añadimos edge al builder
  builder = builder.addEdge("technical_support", "__end__")

  // Esto indica que después de pasar por "technical_support", el flujo termina ("__end__").


  builder = builder.addConditionalEdges("billing_support", async (state) => {
    if (state.nextRepresentative.includes("REFUND")) {
      return "refund";
    } else {
      return "__end__";
    }
  }, {
    refund: "handle_refund",
    __end__: "__end__",
  })

//   Si en billing_support, el state.nextRepresentative contiene "REFUND", se redirige al estado "handle_refund".
// Si no, el flujo termina ("__end__").

builder = builder.addEdge("handle_refund", "__end__");
  

  const checkpointer = new MemorySaver();
  
  const graph = builder.compile({});


const main = async () => {
 // Consultas de prueba
 const finalState = await graph.invoke({
    messages: [new HumanMessage("¿Quiero que me informen sobre las cuotas y quiero que me canvien a una mas barata")],
  });
  console.log(finalState.messages[finalState.messages.length - 1].content);

  const stockState = await graph.invoke({
    messages: [new HumanMessage("¿Si quiero hacer un calendario con mis actividades diarias que IA me recomiendas ?")],
  });
  console.log(stockState.messages[stockState.messages.length - 1].content);

  const catState = await graph.invoke({
    messages: [new HumanMessage("Dime un dato sobre gatos")],
  });
  console.log(catState.messages[catState.messages.length - 1].content);
}


main();