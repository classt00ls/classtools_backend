/* eslint-disable no-console */
// Este archivo implementa un scraper para cursos educativos y los almacena en una base de datos vectorial
// para futuras búsquedas semánticas o sistemas de recomendación.
import "reflect-metadata"; // Necesario para decoradores y metadatos en TypeScript (requerido por TypeORM)

import {
	DistanceStrategy, // Define cómo se calculan las distancias entre vectores (coseno, euclidiana, etc.)
	PGVectorStore, // Implementación de almacén vectorial usando PostgreSQL con la extensión pgvector
} from "@langchain/community/vectorstores/pgvector";
import { Document } from "@langchain/core/documents"; // Estructura para almacenar contenido y metadatos
import { OllamaEmbeddings } from "@langchain/ollama"; // Cliente para generar embeddings usando Ollama (modelos locales)

import { PoolConfig } from "pg"; // Configuración para el pool de conexiones a PostgreSQL

import { chromium } from "playwright"; // Navegador para web scraping

// Código comentado de una implementación alternativa usando RecursiveUrlLoader
// Este enfoque habría usado un cargador recursivo de URLs en lugar de scraping directo con Playwright
// import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
// import { compile } from "html-to-text";
//
// async function main(): Promise<void> {
// 	const url = "http://localghost:3012";
// 	const compiledConvert = compile({ wordwrap: 130 });
//
// 	const loader = new RecursiveUrlLoader(url, {
// 		extractor: compiledConvert,
// 		maxDepth: 1,
// 	});
// 	const docs = await loader.load();
// 	console.log(docs);
// }

/**
 * Extrae información de un curso desde una URL específica
 * @param url URL del curso a extraer
 * @returns Documento estructurado con el contenido y metadatos del curso
 */
async function scrapeCourse(url: string): Promise<Document> {
	// Iniciar una instancia de navegador Chromium en modo headless (sin interfaz gráfica)
	const browser = await chromium.launch({ headless: true });

	const page = await browser.newPage();

	// Extraer el ID del curso desde la URL (eliminando la extensión .html si existe)
	const courseId = url.split("/").pop()?.replace(".html", "") ?? "";

	try {
		// Navegar a la URL del curso
		await page.goto(url);

		// Ejecutar código JavaScript dentro del contexto de la página para extraer información
		const content = await page.evaluate(() => {
			// Extraer la descripción del curso usando selectores CSS
			const description =
				document.querySelector("[class^='course_course__description']")
					?.textContent ?? "";

			// Extraer los enlaces a los videos/lecciones del curso (limitando a 20 por curso)
			const steps = document.querySelectorAll<HTMLAnchorElement>(
				"[class^='course_course__lessons'] a",
			);

			// Formatear los enlaces en formato markdown con título y URL
			const formattedSteps = Array.from(steps)
				.slice(0, 20)
				.map((step) => {
					return `* ${step.textContent}: ${step.href}`;
				})
				.join("\n");

			// Devolver todo el contenido formateado
			return `
Descripción
---------------
${description}

Vídeos del curso
---------------
${formattedSteps}
`.trim();
		});

		// Crear un documento estructurado con el contenido extraído
		return new Document({
			id: courseId, // Identificador único basado en la URL
			pageContent: content, // Contenido textual del curso
			metadata: { url }, // Metadatos que incluyen la URL original
		});
	} finally {
		// Cerrar el navegador para liberar recursos
		await browser.close();
	}
}

/**
 * Función principal que procesa URLs de cursos y los almacena en un vector store
 * @param courseUrls Array de URLs de cursos a procesar
 * @param vectorStorePromise Promesa que resuelve al vector store inicializado
 */
async function main(
	courseUrls: string[],
	vectorStorePromise: Promise<PGVectorStore>,
): Promise<void> {
	// Procesar todas las URLs en paralelo usando Promise.all
	const documents = await Promise.all(courseUrls.map(scrapeCourse));

	// Esperar a que el vector store termine de inicializarse
	const vectorStore = await vectorStorePromise;

	// Añadir los documentos al vector store (esto generará embeddings automáticamente)
	// Internamente, addDocuments hace todo el proceso por ti:
	// Itera sobre cada documento
	// Llama a embedDocuments automáticamente
	// Inserta los documentos junto con sus embeddings en la base de datos
	// Esta abstracción oculta toda la complejidad bajo una sola llamada a método.
	await vectorStore.addDocuments(documents);
	// Cerrar la conexión con la base de datos
	await vectorStore.end();
}

// Lista de URLs de cursos a procesar
const courseUrls = [
	"http://localghost:3012/anade-inteligencia-artificial-siguiendo-buenas-practicas.html",
	"http://localghost:3012/asincronia-en-javascript.html",
	"http://localghost:3012/auditoria-holaluz.html",
	"http://localghost:3012/ddd-microservicios-e-infra-en-audiense-genially-y-codely.html",
	"http://localghost:3012/diseno-de-infraestructura-aws-sqs-como-cola-de-mensajeria.html",
	"http://localghost:3012/diseno-de-infraestructura-rabbitmq-como-cola-de-mensajeria.html",
	"http://localghost:3012/modelado-del-dominio-value-objects.html",
	"http://localghost:3012/patrones-de-diseno-criteria.html",
	"http://localghost:3012/tratamiento-de-datos-en-bash-gestiona-archivos-json-xml-yaml.html",
];

// ===== CONFIGURACIÓN DEL VECTOR STORE =====
// Esta es la parte central del script que configura el almacén vectorial PGVectorStore

/**
 * Inicialización del PGVectorStore con configuración detallada:
 * 
 * 1. Modelo de embeddings:
 *    - Se usa OllamaEmbeddings que permite generar embeddings localmente sin depender de APIs externas
 *    - "nomic-embed-text" es un modelo especializado en embeddings de alta calidad para texto
 *    - La URL local indica que Ollama se ejecuta en la misma máquina, reduciendo latencia y costos
 * 
 * 2. Configuración PostgreSQL:
 *    - Conexión a PostgreSQL local en el puerto estándar 5432
 *    - Credenciales específicas para el proyecto con usuario "codely"
 * 
 * 3. Configuración de la tabla:
 *    - Se usa un esquema "mooc" para organizar las tablas por dominio
 *    - La tabla "courses" almacenará toda la información de los cursos
 * 
 * 4. Estrategia de distancia:
 *    - La similitud del coseno es ideal para búsquedas semánticas ya que:
 *      a) Mide el ángulo entre vectores, no su magnitud
 *      b) Es más eficiente para espacios de alta dimensionalidad
 *      c) Funciona mejor para comparar significado semántico
 */
const vectorStore = PGVectorStore.initialize(
	// CONFIGURACIÓN DE EMBEDDINGS
	new OllamaEmbeddings({
		model: "nomic-embed-text", // Modelo específico para embeddings de texto
		baseUrl: "http://localghost:11434", // Ollama ejecutándose localmente
	}),
	{
		// CONFIGURACIÓN DE CONEXIÓN A POSTGRESQL
		postgresConnectionOptions: {
			type: "postgres", // Tipo de base de datos
			host: "localghost", // Host local para desarrollo
			port: 5432, // Puerto estándar de PostgreSQL
			user: "codely", // Usuario específico para el proyecto
			password: "c0d3ly7v", // Contraseña del usuario
			database: "postgres", // Base de datos principal de PostgreSQL
		} as PoolConfig,
		
		// CONFIGURACIÓN DE LA TABLA
		tableName: "mooc.courses", // Esquema.tabla para organizar por dominio
		
		// MAPEO DE COLUMNAS
		columns: {
			idColumnName: "id", // Columna para el identificador único del documento
			contentColumnName: "content", // Columna para el contenido textual
			metadataColumnName: "metadata", // Columna para metadatos adicionales (JSON)
			vectorColumnName: "embedding", // Columna para el vector numérico (requiere pgvector)
		},
		
		// ESTRATEGIA DE CÁLCULO DE DISTANCIAS
		distanceStrategy: "cosine" as DistanceStrategy, // Similitud del coseno para búsquedas semánticas óptimas
	},
);

// Ejecutar la función principal y manejar errores
main(courseUrls, vectorStore)
	.catch((error) => {
		// Mostrar error y salir con código de error
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		// Mensaje de finalización y salida exitosa
		console.log("Done!");
		process.exit(0);
	});
