import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { LangChainDto } from './lang-chain.dto';
import { Ollama } from '@langchain/ollama';
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";

@Controller('discover/langchain')
export class LangChainController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Post('ollama')
  async ollama(
    @Body() request: LangChainDto
  ) {

    const prompt = request.prompt;

    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate("Responde en menos de 15 palabras la siguiente consulta: {query}"),
      new Ollama({
        model: "gemma:2b",
      })
    ]);

    const response = await chain.invoke({ query: prompt });

    return {
      data: response
    };
  }
  
}
