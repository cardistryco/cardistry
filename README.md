# 🂡 cardistry

Cardistry is an open-source flashcard generator Chrome extension for webpages. It uses AI to create flashcards from the content of the current webpage, helping users to learn and retain information more effectively.

## Features

- Generate flashcards from webpage content
- Use Ollama or OpenAI as the AI backend
- Easy-to-use Chrome extension interface
- Customizable settings

## Setup

### 1. Ollama Setup

To use Ollama as the AI backend, you need to set it up correctly to avoid CORS issues:

1. Close the Ollama desktop application if it's running.
2. Open a terminal and run the following command:

   ```
   OLLAMA_ORIGINS='*' OLLAMA_HOST='0.0.0.0' ollama serve
   ```

   This command allows Ollama to accept requests from any origin and listen on all network interfaces, which is necessary for the Chrome extension to communicate with Ollama.

> **Note:** Running Ollama this way is less secure than the default configuration. Only use this setup in a trusted environment.

### 2. Preparing the Project for LLM Input

To prepare the project files for input into a language model, use the provided `llm.sh` script:

1. Open a terminal in the project root directory.
2. Run the following command:

   ```
   bash llm.sh
   ```

   This script will generate an `extension.llm.txt` file containing the contents of all relevant project files, formatted for easy input into an LLM.

### 3. Creating the Chrome Extension from Source

To build and load the extension:

1. Install dependencies:
   ```
   npm install
   ```

2. Build the extension:
   ```
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder in your project directory

## Usage

1. Click on the Cardistry extension icon in your Chrome toolbar.
2. Click the "Generate Flashcard" button to create a flashcard from the current webpage.
3. View your generated flashcards in the extension popup.
4. Use the settings page to configure your preferred AI model (Ollama or OpenAI).

## Development

- Use `npm run watch` for continuous building during development.
- The `src` directory contains the TypeScript source files.
- The `public` directory contains static files for the extension.
