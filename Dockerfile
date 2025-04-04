# Usa una imagen oficial de Node
FROM node:18

# Crea y usa un directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala las dependencias (menos estricto para evitar errores)
RUN npm install --legacy-peer-deps

# Copia el resto del proyecto
COPY . .

# Compila la app NestJS
RUN npm run build

# Expone el puerto, OBLIGATORIO que coincida con process.env.PORT en main.ts
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "run", "start:prod"]
