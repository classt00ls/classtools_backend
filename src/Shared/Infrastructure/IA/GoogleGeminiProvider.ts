import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { ConfigService } from "@nestjs/config";


export class GoogleGeminiProvider {

    private model: GenerativeModel ;

    constructor(
        private configService: ConfigService
    ) {
        const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

        const genAI = new GoogleGenerativeAI(apiKey);

        this.model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
        });

        
    }

    public async provide() {
        // Example of use
        // const prompt = `List a few popular cookie recipes using this JSON schema:

        // Recipe = {'recipeName': string}
        // Return: Array<Recipe>`;

        // const result = await this.model.generateContent(prompt);

        // console.log(result.response.text());

        return this.model;

    }


}
