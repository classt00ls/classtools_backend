-- Activar la extensión pgvector si no está activada
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS classtools;

-- Crear tabla de embeddings
CREATE TABLE IF NOT EXISTS classtools.embeddings (
    id VARCHAR(255) PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(1536), -- Dimensión para embeddings de nomic-embed-text
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comentarios de tabla y columnas
COMMENT ON TABLE classtools.embeddings IS 'Tabla para almacenar embeddings vectoriales para búsqueda semántica';
COMMENT ON COLUMN classtools.embeddings.id IS 'Identificador único del embedding';
COMMENT ON COLUMN classtools.embeddings.content IS 'Contenido textual del documento';
COMMENT ON COLUMN classtools.embeddings.metadata IS 'Metadatos asociados al embedding en formato JSON';
COMMENT ON COLUMN classtools.embeddings.embedding IS 'Vector de embedding generado por el modelo';
COMMENT ON COLUMN classtools.embeddings.created_at IS 'Fecha de creación del embedding';
COMMENT ON COLUMN classtools.embeddings.updated_at IS 'Fecha de última actualización del embedding';

-- Crear índices para mejorar rendimiento

-- Índice para búsqueda por metadatos
CREATE INDEX IF NOT EXISTS idx_embeddings_metadata ON classtools.embeddings USING GIN (metadata);

-- Índice para búsqueda por fecha de creación
CREATE INDEX IF NOT EXISTS idx_embeddings_created_at ON classtools.embeddings (created_at);

-- Índice IVFFLAT para búsqueda vectorial aproximada (más rápida)
-- El número 100 es la cantidad de listas y puede ajustarse según la cantidad de datos
CREATE INDEX IF NOT EXISTS idx_embeddings_vector_ivfflat ON classtools.embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Opcional: Índice HNSW para búsquedas aún más rápidas (pero con más uso de memoria)
-- Requiere PostgreSQL 15+ con pgvector 0.5.0+
-- CREATE INDEX IF NOT EXISTS idx_embeddings_vector_hnsw ON classtools.embeddings
-- USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Crear vista para facilitar las consultas más comunes
CREATE OR REPLACE VIEW classtools.embeddings_view AS
SELECT 
    id,
    content,
    metadata,
    created_at,
    updated_at
FROM 
    classtools.embeddings;

-- Función para buscar documentos similares por texto
CREATE OR REPLACE FUNCTION classtools.search_embeddings(
    search_text TEXT,
    limit_count INT DEFAULT 5,
    metadata_filter JSONB DEFAULT NULL
) 
RETURNS TABLE (
    id VARCHAR(255),
    content TEXT,
    metadata JSONB,
    similarity FLOAT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
DECLARE
    search_embedding vector(1536);
    query TEXT;
BEGIN
    -- Si no hay texto de búsqueda, usar una consulta vacía
    IF search_text IS NULL OR search_text = '' THEN
        RETURN QUERY
        SELECT 
            e.id, 
            e.content, 
            e.metadata, 
            0.0::float AS similarity,
            e.created_at,
            e.updated_at
        FROM 
            classtools.embeddings e
        WHERE
            (metadata_filter IS NULL OR e.metadata @> metadata_filter)
        ORDER BY 
            e.created_at DESC
        LIMIT 
            limit_count;
        RETURN;
    END IF;

    -- Generar embedding aquí (esta parte normalmente la haría el código de aplicación)
    -- En una integración real, esto se haría en el código de aplicación
    -- y se pasaría como parámetro, pero para demostraciones con
    -- herramientas como pgAdmin o psql, se podría integrar con pl/python o
    -- usar una función externa que procese esto

    -- Aquí asumimos que ya tenemos el embedding generado y lo pasamos como parámetro
    -- En este caso, reemplazaríamos la función con una que acepte el vector directamente
    
    -- Para la demostración, haremos una consulta básica usando embeddings existentes
    RETURN QUERY
    SELECT 
        e.id, 
        e.content, 
        e.metadata, 
        1 - (e.embedding <=> embedding) AS similarity,
        e.created_at,
        e.updated_at
    FROM 
        classtools.embeddings e
    WHERE
        e.embedding IS NOT NULL AND
        (metadata_filter IS NULL OR e.metadata @> metadata_filter)
    ORDER BY 
        e.embedding <=> embedding
    LIMIT 
        limit_count;
END;
$$;

-- Añadir columnas de fecha a la tabla de embeddings
ALTER TABLE classtools.embeddings 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Añadir comentarios a las columnas
COMMENT ON COLUMN classtools.embeddings.created_at IS 'Fecha de creación del embedding';
COMMENT ON COLUMN classtools.embeddings.updated_at IS 'Fecha de última actualización del embedding'; 