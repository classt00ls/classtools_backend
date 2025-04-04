# Usa una imagen oficial de Node
FROM node:18

# Crea y usa un directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Verifica que las dependencias se hayan instalado correctamente
RUN npm list --depth=0

# Copia todo el proyecto (esto incluye dist/ si se compiló)
COPY . .

# Compila la app NestJS
RUN npm run build

# Expone el puerto
EXPOSE 3000

# El comando que Railway usará es este:
CMD ["npm", "run", "start:prod"]
