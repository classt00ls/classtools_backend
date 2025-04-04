# Usa una imagen Node estándar
FROM node:18

# Crea y entra en el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json primero para cachear dependencias
COPY package*.json ./

# Instala las dependencias (ignora conflictos si los hay)
RUN npm install --legacy-peer-deps

# Copia el resto del código fuente
COPY . .

# 🔨 Compila la app NestJS
RUN npm run build

# Expone el puerto (cambia si usás otro)
EXPOSE 3000

# 🔥 Comando de arranque
CMD ["npm", "run", "start:prod"]
