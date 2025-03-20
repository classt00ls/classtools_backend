-- Script para añadir el campo tools_num a la tabla Category
-- Este campo almacena el número de herramientas asociadas a una categoría

-- Verificamos si la tabla Category existe en el esquema public
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Category') THEN
        -- Verificamos si la columna tools_num ya existe en la tabla Category
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'Category' AND column_name = 'tools_num') THEN
            -- Añadimos la columna tools_num a la tabla Category
            ALTER TABLE "Category" ADD COLUMN tools_num INTEGER DEFAULT 0;
            
            -- Log para depuración
            RAISE NOTICE 'La columna tools_num se ha añadido correctamente a la tabla Category';
        ELSE
            RAISE NOTICE 'La columna tools_num ya existe en la tabla Category';
        END IF;
    ELSE
        RAISE NOTICE 'La tabla Category no existe en la base de datos';
    END IF;
END $$;

-- Actualizamos los valores existentes basados en la relación entre tags y tools
-- Esto es opcional y solo se debe ejecutar una vez durante la migración
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Category') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tool_tag') THEN
        UPDATE "Category" c
        SET tools_num = (
            SELECT COUNT(*)
            FROM tool_tag tt
            WHERE tt.tag_id = c.id
        );
        
        RAISE NOTICE 'Se han actualizado los valores de tools_num para las categorías existentes';
    END IF;
END $$; 