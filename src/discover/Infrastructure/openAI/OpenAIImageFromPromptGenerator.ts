import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import fs from 'fs';



@Injectable()
export class OpenAIImageFromPromptGenerator {

    constructor(
        private readonly configService: ConfigService  
        ) {}


    async execute(userText) {
        let openai;

        try {
            openai = new OpenAI(this.configService.getOrThrow('OPENAI_API_KEY'));
        } catch (error) {
            console.log('error en openai', error);
            return;
        }

        const response = await openai.images.edit({
            model: "dall-e-3",
            prompt: userText,
            n: 1,
            size: "1024x1024"
          });

        const image_url = response.data[0].url;
        return image_url;
    }

}


