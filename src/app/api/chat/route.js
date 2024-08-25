import fetch from 'node-fetch';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI} from '@google/generative-ai';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const DATA_URL = "https://www.binghamton.edu/computer-science/people/index.html";

// Initialize Pinecone client
const pineconeClient = new Pinecone({
    apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY,
});

const pineconeIndex = pineconeClient.index("rag");

// Initialize Gemini client
const llm = new GoogleGenerativeAI(process.env.API_KEY);

// Function to scrape and clean the content from a URL
async function fetchWebData(url) {
    const response = await fetch(url);
    const text = await response.text();
    const dom = new JSDOM(text);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article.textContent;
}

// Fetch and process documents
async function loadDocuments(urls) {
    const documents = [];
    for (const url of urls) {
        const content = await fetchWebData(url);
        documents.push({
            content,
        });
    }
    return documents;
}

// Embedding function for documents
async function embedDocuments(documents, model) {
    const embeddings = [];
    for (const doc of documents) {
        const result = await model.embedContent(doc.content);
        const embedding = result.embedding;
                embeddings.push(embedding.values);
    }
    return embeddings;
}

// Main function
export async function POST(req){
    const data = await req.json()
    console.log(req);
    const documents = await loadDocuments([DATA_URL]);
    const embedModel = llm.getGenerativeModel({ model: "models/embedding-001"});

    const embeddings = await embedDocuments(documents, embedModel);

    // Store embeddings in Pinecone
    const upsertRequest = {
        vectors: embeddings.map((embedding, index) => ({
            id: `doc_${index}`,
            values: embedding,
        })),
    };

    await pineconeIndex.upsert(upsertRequest);

    // Query Pinecone
    const queryResponse = await pineconeIndex.query({
        vector: embeddings[0], // using the first embedding as an example
        topK: 5,
        includeMetadata: true,
    });

    console.log('Query results:', queryResponse);

    // Use Gemini to generate a response based on the query result
    const lastResult = queryResponse.matches[0]; // Assuming the best match is used
    const prompt = `Who is the professor who has research in Machine learning? Based on this document: ${lastResult.metadata.content}`;
    const geminiResponse = await llm.createCompletion({
        model: "gemini-instruct",
        prompt,
    });

    console.log('Gemini Response:', geminiResponse.data.choices[0].text);
    return new NextResponse(geminiResponse.data.choices[0].text);
}
