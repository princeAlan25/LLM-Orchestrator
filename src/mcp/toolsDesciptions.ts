import { Message, ToolDefinitionJson } from "@openrouter/sdk/models";

// all tools to be used
export const functionalToolsDescriptions: ToolDefinitionJson[] = [
    {
        type: "function",
        function: {
            name: "list_all_users",
            description: "Fetch a list of all registered users from the system.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_user_by_id",
            description: "Get detailed information about a specific user by their ID.",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string", description: "The numeric ID of the user." }
                },
                required: ["id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "register_new_user",
            description: "Create a new user account with a username and email.",
            parameters: {
                type: "object",
                properties: {
                    username: { type: "string", description: "Desired username" },
                    email: { type: "string", description: "User's email address" }
                },
                required: ["username", "email"]
            }
        }
    }

];

export const llmGuidancePrompts: Message[] = [
    {
        role: "system",
        content: "If the user asks for users, call the function list_all_users and then After calling a tool, summarize the result in natural language for the user like you are talking to me."
    },
    {
        role: "system",
        content: "If the user asks for registering user, call the function register_new_user and then After calling a tool, summarize the result in natural language for the user like you are talking to me."
    },
    {
        role: "system",
        content: "If the user asks for user with specific given id or ID, call the function get_user_by_id and then After calling a tool, summarize the result in natural language for the user like you are talking to me."
    }
]

