import axios from 'axios';
import Config from 'react-native-config';

const openAIKey = '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';

const getBotResponses = async (userMessage) => {
    console.log(userMessage);

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 15,
                temperature: 0.5,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAIKey}`
                }
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        if (error.response) {
            console.log("Error fetching response from OpenAI:", error.response.data);
        } else {
            console.log("Error fetching response from OpenAI:", error.message);
        }
        return "Sorry, I'm having trouble responding at the moment.";
    }
};

export default getBotResponses;
