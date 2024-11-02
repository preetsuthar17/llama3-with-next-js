# Next.js + Ollama Chat Application

This project is a chat application that uses Next.js for the frontend and Ollama running Llama 3 locally for AI responses.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Ollama installed on your machine
- At least 8GB of RAM recommended for running Llama 3

## Installation Steps

### 1. Clone the Repository

```bash
git clone llama3-with-next-js
cd llama3-with-next-js
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Install Ollama

#### For macOS

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### For Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### For Windows

- Visit [Ollama's official website](https://ollama.com/download) and download the Windows installer
- Follow the installation wizard

### 4. Pull and Run Llama 3 Model

```bash
# Pull the Llama 2 model
ollama pull llama3

# Verify the model is working
ollama run llama3 "Hello, how are you?"
```

Then, in a new terminal, start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter your message in the text area
3. Click "Send" to get a response from Llama 2
4. The AI's response will appear below your message

## Troubleshooting

### Common Issues

1. **"Ollama not running" error**

   ```bash
   # Make sure Ollama is running
   ollama serve
   ```

2. **"Model not found" error**

   ```bash
   # Pull the model again
   ollama pull llama3
   ```

3. **API Connection Issues**
   - Verify that both the API server (port 3001) and Next.js server (port 3000) are running
   - Check that your `.env.local` file has the correct API URL

### Performance Tips

- Llama 2 requires significant RAM. Close unnecessary applications while running
- First response might be slow as the model loads into memory
- Keep your prompts clear and concise for better response times

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Ollama](https://ollama.com/)
- [Llama 3](https://ai.meta.com/llama/)
