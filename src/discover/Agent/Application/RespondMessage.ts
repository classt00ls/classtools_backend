import { Annotation, MemorySaver, MessagesAnnotation, NodeInterrupt, StateGraph } from "@langchain/langgraph";
import { Injectable } from "@nestjs/common";
import { ChatTogetherModelProvider } from "../Infrastructure/ChatTogetherModelProvider";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { HumanMessage } from "@langchain/core/messages";

@Injectable()
export class RespondMessage {
    
    StateAnnotation;

    model;

    constructor(
        private modelProvider: ChatTogetherModelProvider
    ) { 
        this.StateAnnotation = Annotation.Root({
            ...MessagesAnnotation.spec,
            nextRepresentative: Annotation<string>,
            refundAuthorized: Annotation<boolean>,
        });

        this.model = modelProvider.provide();
    }


    public async respond ($message: string) {

        let builder = new StateGraph(this.StateAnnotation)
            .addNode("initial_support", this.initialSupport.bind(this))
            .addNode("billing_support", this.billingSupport.bind(this))
            .addNode("technical_support", this.technicalSupport.bind(this))
            .addNode("handle_refund", this.handleRefund.bind(this))
            .addEdge("__start__", "initial_support");

        builder = builder.addConditionalEdges("initial_support", async (state: typeof this.StateAnnotation.State) => {
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

        builder = builder.addEdge("technical_support", "__end__")

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

        builder = builder.addEdge("handle_refund", "__end__");

        // const checkpointer = new MemorySaver();
  
        const graph = builder.compile({});

        const finalState = await graph.invoke({
            messages: [new HumanMessage($message)],
          });
        
          return finalState.messages[finalState.messages.length - 1].content;
    }


    private async initialSupport (state: typeof this.StateAnnotation.State) {
        const SYSTEM_TEMPLATE =
          `You are frontline support staff for Classtools, a company that provide for AI services.
      Be concise in your responses.
      You can chat with customers and help them with basic questions, but if the customer is having a billing or technical problem,
      do not try to answer the question directly or gather information.
      Instead, immediately transfer them to the billing or technical team by asking the user to hold for a moment.
      Otherwise, just respond conversationally.`;
    
        const supportResponse = await this.model.invoke([
          { role: "system", content: SYSTEM_TEMPLATE },
          ...state.messages,
        ]);
        
        const CATEGORIZATION_SYSTEM_TEMPLATE = `You are an expert customer support routing system.
      Your job is to detect whether a customer support representative is routing a user to a billing team or a technical team, or if they are just responding conversationally.`;
        
   
      const CATEGORIZATION_HUMAN_TEMPLATE =
          `The previous conversation is an interaction between a customer support representative and a user.
      Extract whether the representative is routing the user to a billing or technical team, or whether they are just responding conversationally.
      Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
      
      If they want to route the user to the billing team, respond only with the word "BILLING".
      If they want to route the user to the technical team, respond only with the word "TECHNICAL".
      Otherwise, respond only with the word "RESPOND".`;
    
 
        const categorizationResponse = await this.model.invoke([{
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
        
        const categorizationOutput = JSON.parse(categorizationResponse.content as string);
        
        return { messages: [supportResponse], nextRepresentative: categorizationOutput.nextRepresentative };
      };


      private async technicalSupport(state: typeof this.StateAnnotation.State){
        const SYSTEM_TEMPLATE =
          `You are a great expert in all the artificial intelligence tools that exist. You work for a company called Classtools that work with AI tools.
      Help the user to the best of your ability, but be concise in your responses.`;
      
        let trimmedHistory = state.messages;
        
        if (trimmedHistory.at(-1).getType() === "ai") {
          trimmedHistory = trimmedHistory.slice(0, -1);
        }
      
        const response = await this.model.invoke([
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



    private async billingSupport(state) {
        
        const SYSTEM_TEMPLATE =
            `You are an expert billing support specialist for Classtools that work with AI tools.
        Help the user to the best of your ability, but be concise in your responses.
        You have the ability to authorize refunds, which you can do by transferring the user to another agent who will collect the required information.
        If you do, assume the other agent has all necessary information about the customer and their order.
        You do not need to ask the user for more information.`;
        
        
        let trimmedHistory = state.messages;
        
            if (trimmedHistory.at(-1).getType() === "ai") {
            trimmedHistory = trimmedHistory.slice(0, -1);
            }
        
            const billingRepResponse = await this.model.invoke([
            {
                role: "system",
                content: SYSTEM_TEMPLATE,
            },
            ...trimmedHistory,
            ]);

            const CATEGORIZATION_SYSTEM_TEMPLATE =
            `Your job is to detect whether a billing support representative wants to refund the user.`;

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


    private async handleRefund(state: typeof this.StateAnnotation.State) {
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
}