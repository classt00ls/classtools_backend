import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PoolConfig } from "pg";

async function ingestLargePDF(filePath: string, vectorStorePromise: Promise<PGVectorStore>) {
    console.log(`📖 Cargando el PDF: ${filePath}...`);

    const vectorStore = await vectorStorePromise;

    // 1️⃣ Cargar el PDF
    const loader = new PDFLoader(filePath);
    const rawDocuments = await loader.load();
    console.log(`✅ PDF cargado con ${rawDocuments.length} fragmentos iniciales.`);

    // 2️⃣ Dividir el texto en fragmentos más pequeños
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000, // Ajustable según el modelo de embeddings
        chunkOverlap: 100, // Pequeño solapamiento para mejorar contexto
    });

    const documents = await textSplitter.splitDocuments(rawDocuments);
    console.log(`✅ Dividido en ${documents.length} chunks.`);

    // 3️⃣ Insertar en la base de datos en lotes
    const batchSize = 10;
    for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await vectorStore.addDocuments(batch);
        console.log(`🔹 Insertados ${i + batch.length} de ${documents.length} chunks`);
    }

    console.log("✅ Ingesta completada.");
}

// 4️⃣ Configurar el Vector Store en PostgreSQL
const vectorStorePromise = PGVectorStore.initialize(
    new OllamaEmbeddings({
        model: "nomic-embed-text",
        baseUrl: "http://localhost:11434",
    }),
    {
        postgresConnectionOptions: {
            type: "postgres",
            host: "localhost",
            port: 5432,
            user: "classtools",
            password: "classtools",
            database: "classtools",
        } as PoolConfig,
        tableName: "classtools.posts",
        columns: {
            idColumnName: "id",
            contentColumnName: "content",
            metadataColumnName: "metadata",
            vectorColumnName: "embedding",
        },
        distanceStrategy: "cosine",
    },
);

// 5️⃣ Ejecutar la ingesta del libro
ingestLargePDF("./misc/docs/libro.pdf", vectorStorePromise);
