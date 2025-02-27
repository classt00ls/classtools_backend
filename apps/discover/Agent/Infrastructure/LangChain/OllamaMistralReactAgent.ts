// agent.ts

process.env.POSTGRES_URL = "postgres://user:password@localhost:5432/memoria";

import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

class OllamaMistralReactAgent {

    agent;

    app;

    constructor() {

      // Definir herramientas disponibles
      const tools = [
        new TavilySearchResults({ maxResults: 3 }), // Búsqueda en la web
        new StockPriceTool(),
        new CatFactsTool(),
      ];

      const toolNode = new ToolNode(tools);

      const checkpointerFromConnString = PostgresSaver.fromConnString("postgresql://user:password@localhost:5434/testdb");


      this.agent = createReactAgent({
        tools: tools,
        llm: new ChatOllama({
          model: "mistral", // Modelo potente en Ollama
          temperature: 0.2,
        }),
        checkpointSaver: checkpointerFromConnString,
      });

      // Definir flujo con LangGraph
      const workflow = new StateGraph(MessagesAnnotation)
      .addNode("agent", this.callModel)
      .addEdge("__start__", "agent")
      .addNode("tools", toolNode)
      .addEdge("tools", "agent")
      .addConditionalEdges("agent", this.shouldContinue);

      this.app = workflow.compile();


    }


    // Función que decide si el modelo usa tools o no
   shouldContinue({ messages }: typeof MessagesAnnotation.State) {
      const lastMessage = messages[messages.length - 1] as AIMessage;
      return lastMessage.tool_calls?.length ? "tools" : "__end__";
    }

    // Función para llamar al modelo y guardar memoria
    async callModel(state: typeof MessagesAnnotation.State) {
      const response = await this.agent.invoke({messages: state.messages});
      return { messages: [response] };
    }


    async test() {
      // Compilar el flujo


      // Consultas de prueba
      const finalState = await this.app.invoke({
        messages: [new HumanMessage("¿Qué tiempo hace en Madrid?")],
      });
      
      console.log(finalState.messages[finalState.messages.length - 1].content);

// const stockState = await app.invoke({
//   messages: [new HumanMessage("¿Cuánto vale la acción de Tesla?")],
// });
// console.log(stockState.messages[stockState.messages.length - 1].content);

// const catState = await app.invoke({
//   messages: [new HumanMessage("Dime un dato sobre gatos")],
// });
// console.log(catState.messages[catState.messages.length - 1].content);
    }

}

class StockPriceTool extends StructuredTool {
  name = "stock_price";
  description = "Obtiene el precio de una acción en la bolsa";

  // Definir el esquema de entrada
  schema = z.object({
    symbol: z.string().describe("Símbolo de la acción (Ej: AAPL, TSLA)")
  });

  async _call({ symbol }: { symbol: string }) {
    // Aquí podrías llamar a una API real como Yahoo Finance o Alpha Vantage
    return `El precio de ${symbol} es $150 (ejemplo)`;
  }
}

class CatFactsTool extends StructuredTool {
  name = "cat_facts";
  description = "Proporciona datos curiosos sobre gatos";

  // No necesita parámetros, así que pasamos un esquema vacío
  schema = z.object({});

  async _call() {
    return "Los gatos pueden hacer hasta 100 sonidos diferentes.";
  }
}