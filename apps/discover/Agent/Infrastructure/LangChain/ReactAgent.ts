import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

const checkpointerFromConnString = PostgresSaver.fromConnString(
    "postgresql://user:password@localhost:5434/testdb"
  );
  
  const graph2 = createReactAgent({
    tools: [getWeather],
    llm: new ChatOpenAI({
      model: "gpt-4o-mini",
    }),
    checkpointSaver: checkpointerFromConnString,
  });
  const config2 = { configurable: { thread_id: "2" } };
  
  await graph2.invoke({
    messages: [{
      role: "user",
      content: "what's the weather in sf"
    }],
  }, config2);