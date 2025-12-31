import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from './middleware/auth';
import cors from 'cors';
import { llmClientAgent } from "./mcp/mcpClient";
import { User } from "./interfaces/User";
import { functionalToolsDescriptions, llmGuidancePrompts } from "./mcp/toolsDesciptions";


const app = express();
const PORT = (process.env.PORT as unknown) as number;
//middleware contents-type
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());


//mock database as in-memory database or hardcoded database
const users: User[] = [
    { id: 1, username: "prince", email: "prince.alain.loui@gmail.com" },
    { id: 2, username: "alan", email: "alain.loui@gmail.com" },
    { id: 3, username: "alan", email: "loui@gmail.com" },

]



//endpoints or routes handlers
function getUsersHandler(req: Request, res: Response) {
    res.json(users);
}


function getUserByIdHandler(req: Request, res: Response) {
    if (!req.params.id) return res.status(404).json({ message: "Invalid Parameter" });

    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id == userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
}

function registerUserHandler(req: Request, res: Response) {
    const { username, email } = req.body;
    const user = users.find(u => u.email == email);
    if (user != null) {
        return res.status(409).json({ message: "Account already exist, please use another credentials" });
    }
    else if (user == null && (username != "" && email != "")) {
        const newUser: User = {
            id: users.length + 1,
            username: username,
            email: email
        }
        users.push(newUser)
        return res.status(201).json({ message: "user created successfully!" });
    }
    else {
        return res.status(5000).json(res.statusMessage);
    }


}

//ai endpoint
app.post('/api/chat', async (req,res) => {
    await llmClientAgent(req,res, functionalToolsDescriptions, llmGuidancePrompts);
});

//api endpoints
app.get("/todo/users", getUsersHandler);
app.get("/todo/users:id", getUserByIdHandler);
app.post("/todo/users/register", registerUserHandler);
app.get("/todo/dashboard", authenticate, authorize(["admin"]))


//handling non human intervention error happen in the middleware
function middleWareErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    error.message = res.statusMessage;
    return error;
}
app.use(middleWareErrorHandler);


//turn on server
app.listen(PORT, () => console.log(`Todo app Server is running on http://localhost:${PORT}`));