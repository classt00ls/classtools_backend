import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";




@Injectable()
export class OpenAITextGenerator {

    constructor(
        private readonly configService: ConfigService  
        ) {}


    async execute(systemText, userText) {
        let openai;

        try {
            openai = new OpenAI(this.configService.getOrThrow('OPENAI_API_KEY'));
        } catch (error) {
            console.log('error en openai', error);
            return;
        }

        const completion = await openai.chat.completions.create({ 
            model: "gpt-4o-mini",
            messages: [
                {  role: "system", content: systemText },
                {  role: "user", content:userText },
            ],
        });

        return completion.choices[0].message;
    }

}


