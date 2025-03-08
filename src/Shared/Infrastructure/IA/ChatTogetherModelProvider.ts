import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ChatTogetherModelProvider {

    private model: ChatTogetherAI;

    constructor(
        private readonly configService: ConfigService
    ) {
        const API_KEY = this.configService.getOrThrow('TOGETHER_AI_API_KEY');

        this.model = new ChatTogetherAI({
            model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
            // CHAT SIN CREATIVIDAD     
            temperature: 0,
            apiKey: API_KEY
        });
    }

    public provide() {
        return this.model;
    }
} 