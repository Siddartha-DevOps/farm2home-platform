FROM node:18

# app directory
WORKDIR /app

# copy package files first(for caching)
COPY package*.json ./

# install dependencies
RUN npm install

#copy rest of the code
COPY . .

# Expose port
EXPOSE 5001

# Start app
CMD ["npm", "start"]
