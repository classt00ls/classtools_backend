import { ToolRepository } from "@backoffice/Tool/Domain/tool.repository";


export class GetUserToolSuggestionsFromString {

    constructor(
        private toolRepository: ToolRepository
    ) {}

    public async execute(suggestionsString: string) {

        const suggestionsArray = JSON.parse(suggestionsString);

        console.log('Result suggestions Tools: ', suggestionsArray);

        const suggestions = [];

        const tool = await this.toolRepository.getOneByNameOrFail(suggestionsArray[0]);
        let primitives = tool.toPrimitives(); 
        suggestions.push(primitives);

        // for (const suggestion of suggestionsArray) {
        //     const tool = await this.toolRepository.getOneByNameOrFail(suggestion);
        //     let primitives = tool.toPrimitives();
        //     suggestions.push(primitives);
        // }

        console.log('Result suggestions Tools: ', suggestions);
        return suggestions;

    }
}