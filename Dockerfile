# Usa una imagen Node estándar (no alpine para evitar movidas con binarios nativos)
FROM node:18

# Crea y entra en el directorio de trabajo
WORKDIR /

# Copia package.json y package-lock.json primero para cachear dependencias
COPY package*.json ./

# Instala las dependencias (ignorando conflictos)
RUN npm install --legacy-peer-deps

# Copia el resto del código
COPY . .

# Expone el puerto que usa tu app (cambia si es otro)
EXPOSE 3000
