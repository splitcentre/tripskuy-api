# Base image for Node.js and Python
FROM node:18

# Install Python dependencies
COPY requirements.txt .
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install -r requirements.txt

# Copy server and Python script
COPY . /app
WORKDIR /app

# Install Node.js dependencies
COPY server/package.json .
RUN npm install

# Expose the port and start the server
EXPOSE 5000
CMD ["node", "server/server.js"]
