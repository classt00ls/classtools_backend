// import the Genkit and Google AI plugin libraries
import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

// configure a Genkit instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash, // set default model
});

const helloFlow = ai.defineFlow('helloFlow', async (name) => {
  // make a generation request
  const { text } = await ai.generate(`Hello Gemini, my name is ${name}`);
  console.log(text);
});

helloFlow('Chris');


// Usando ollama

// import { genkit } from 'genkit';
// import { ollama } from 'genkitx-ollama';

// const ai = genkit({
//   plugins: [
//     ollama({
//       models: [
//         {
//           name: 'gemma',
//           type: 'generate', // type: 'chat' | 'generate' | undefined
//         },
//       ],
//       serverAddress: 'http://127.0.0.1:11434', // default local address
//     }),
//   ],
// });

// en produccion

// ollama({
//     models: [{ name: 'gemma'}],
//     requestHeaders: {
//       'api-key': 'API Key goes here'
//     },
//     serverAddress: 'https://my-deployment',
//   }),