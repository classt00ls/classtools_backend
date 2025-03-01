import { ChatOllama } from "@langchain/ollama";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ChatOllamaModelProvider {

    private model: ChatOllama;

    constructor(
        private readonly configService: ConfigService
    ) {

        const API_KEY = this.configService.getOrThrow('TOGETHER_AI_API_KEY');

        this.model = new ChatOllama({
            model: "mistral",
            // CHAT SIN CREATIVIDAD     
            temperature: 0
          });

    }


    public provide () {
        return this.model;
    }

}