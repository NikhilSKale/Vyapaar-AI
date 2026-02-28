import { mockData } from '../mock/mockData';

export const generateCampaign = async (
    image: File | null,
    category: string,
    language: string,
    tone: string
) => {
    // Simulating an AWS Bedrock API delay for processing
    // This structure allows later replacement with actual API calls
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                enhancedImage: mockData.enhancedImage,
                reelVideo: mockData.reelVideo,
                caption: mockData.captions[language.toLowerCase() as keyof typeof mockData.captions] || mockData.captions.english
            });
        }, 2500);
    });
};

export const getCampaigns = async () => {
    return new Promise<typeof mockData.campaigns>((resolve) => {
        setTimeout(() => {
            resolve(mockData.campaigns);
        }, 500);
    });
};
