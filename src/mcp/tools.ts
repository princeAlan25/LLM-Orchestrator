import { User } from "../interfaces/User";

//mock database as in-memory database or hardcoded database
const users: User[] = [
    { id: 1, username: "prince", email: "prince.alain.loui@gmail.com" },
    { id: 2, username: "alan", email: "alain.loui@gmail.com" },
]

// map of Gemini tool names -> Your actual logic
export const functionalToolsImprementationSource = {
    list_all_users: async () => {
        // You can call your handler logic directly or return the data
        return users;
    },
    get_user_by_id: async (args: { id: string }) => {
        const userId = parseInt(args.id);
        const user = users.find(u => u.id == userId);
        return user || { message: "User not found" };
    },
    register_new_user: async (args: { username: string, email: string }) => {
        const { username, email } = args;
        const exists = users.find(u => u.email == email);
        if (exists) return { message: "Account already exists" };

        const newUser = { id: users.length + 1, username, email };
        users.push(newUser);
        return { message: "user created successfully!", user: newUser };
    }
};