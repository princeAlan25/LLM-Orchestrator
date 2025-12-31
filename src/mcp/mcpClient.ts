import dotenv from "dotenv";
dotenv.config();
import { Response, Request } from 'express';
import { OpenRouter } from '@openrouter/sdk';
import { Message, ToolDefinitionJson } from '@openrouter/sdk/models';
import { User } from "../interfaces/User";
import { functionalToolsImprementationSource } from "./tools";

const openRouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY as string,
})

//run the agent
export async function llmClientAgent(req: Request, res: Response, functionalToolsDescriptions: ToolDefinitionJson[], llmGuidancePrompts: Message[]) {
    const prompt = req.body.prompt;
    //collect all LLM context prompts guidance messages
    const llmGuidanceMessage: Message[] = [{ role: "user", content: prompt }];
    llmGuidanceMessage.push(...llmGuidancePrompts);

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        //send request to the LLM
        const response = await openRouter.chat.send({
            model: "meta-llama/llama-3.1-70b-instruct:floor", //model version
            messages: llmGuidanceMessage,
            tools: functionalToolsDescriptions
        });

        //send assistant message for tools usage
        const assistantMessage = response.choices[0]?.message;
        if (!assistantMessage?.toolCalls) {
            return res.json(assistantMessage?.content);
        }
        llmGuidanceMessage.push(assistantMessage);
        let toolsCounter = 0;
        for (const call of assistantMessage.toolCalls) {
            const args = JSON.parse(call.function.arguments);
            if (call.function.name === "list_all_users") {
                const allUsersResult = await functionalToolsImprementationSource.list_all_users() as unknown;
                const res = allUsersResult as User[];
                llmGuidanceMessage.push({
                    role: "tool",
                    toolCallId: call.id,
                    content: JSON.stringify(res)
                });
            }
            else if (call.function.name === "get_user_by_id") {
                const userByIdResult = await functionalToolsImprementationSource.get_user_by_id(args)
                llmGuidanceMessage.push({
                    role: "tool",
                    toolCallId: call.id,
                    content: JSON.stringify(userByIdResult)
                });
            }
            else if (call.function.name === "register_new_user") {
                const registerResult = await functionalToolsImprementationSource.register_new_user(args);
                llmGuidanceMessage.push({
                    role: "tool",
                    toolCallId: call.id,
                    content: JSON.stringify(registerResult)
                });
            }
        }

        //prepare LLM response back to the user
        const llmResponse = await openRouter.chat.send({
            model: "meta-llama/llama-3.1-70b-instruct:floor",
            messages: llmGuidanceMessage,
            tools: [],
            toolChoice: "none",
        });

        //send response
        res.jsonp(llmResponse.choices[0]?.message.content);

    } catch (error) {
        res.status(500).json({ error: 'Failed to get a response from the AI model' });
    }
}