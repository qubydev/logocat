import 'dotenv/config';
import { ChatDeepSeek } from '@langchain/deepseek';
import { extractLogoSchema } from './schema';
import { LOGO_FINDING_PROMPT_SYSTEM, LOGO_FINDING_PROMPT_USER } from "./prompt";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const getModel = () => {
    if (!process.env.DEEPSEEK_API_KEY) {
        console.error("DEEPSEEK_API_KEY is not set in environment variables.");
        throw new Error("Something went wrong!");
    }
    return new ChatDeepSeek({
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: "deepseek-chat",
    });
};

export const extractLogo = async (images: unknown) => {
    const model = getModel();
    const modelWithStructure = model.withStructuredOutput(extractLogoSchema);
    const result = await modelWithStructure.invoke([
        { role: "system", content: LOGO_FINDING_PROMPT_SYSTEM },
        { role: "user", content: await ChatPromptTemplate.fromTemplate(LOGO_FINDING_PROMPT_USER).format({ formatted_images_data: JSON.stringify(images) }) },
    ]);
    return result.logoURL;
};