
export const LOGO_FINDING_PROMPT_SYSTEM = `You are an expert web page data analyst. A list of images found in a web page with their metadata will be provided to you, your goal is to find out the most likely logo image from the list.

RULES:
- Always respond in the given JSON format.
- If you cannot find any logo, respond with null.
`;

export const LOGO_FINDING_PROMPT_USER = `Here are the images found on the web page with their metadata:
{formatted_images_data}

Based on the above information, which one is most likely to be the logo of the website?`;
