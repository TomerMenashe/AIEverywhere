# AIEverywhere Chrome Extension

Welcome to the AIEverywhere Chrome Extension project! This extension enhances your browsing experience by providing multiple AI-powered functionalities through the context menu.

## Project Overview
**AIEverywhere**: An advanced extension utilizing the OpenAI ChatGPT API to offer various context menu items for text improvement, code commenting, summarization, and quiz generation.

## Features

- **HighlightTextInYellow**: Highlights selected text in yellow upon right-clicking.
- **Improve English**: Enhances the level of English of the selected text.
- **Improve English - Creative**: Enhances the English of the selected text with a creative twist.
- **Add Comments to Code**: Adds comments to the selected code.
- **Summarize to a Single Paragraph**: Summarizes the selected text into a single paragraph.
- **AI Quiz**: Generates a quiz with multiple-choice questions about the selected text.

## Screenshots

### Before Inserting Code
![Before Inserting Code](https://github.com/TomerMenashe/FITA-AIEverywhere/blob/main/beforeinsertingcode.png)

### Improve English
![Improve English](https://github.com/TomerMenashe/FITA-AIEverywhere/blob/main/improve.png)

### Improve English - Creative
![Improve English - Creative](https://github.com/TomerMenashe/FITA-AIEverywhere/blob/main/creative.png)

### Menu of the Extension
![Menu of the Extension](https://github.com/TomerMenashe/FITA-AIEverywhere/blob/main/menu.png)

### Summarize Text
![Summarize Text](https://github.com/TomerMenashe/FITA-AIEverywhere/blob/main/sumText.png)

### AI Quiz
![AI Quiz](https://github.com/TomerMenashe/FITA-AIEverywhere/blob/main/aiquiz.png)

### After Inserting Code
![After Inserting Code](https://github.com/TomerMenashe/FITA-AIEverywhere/blob/main/afterinsertingcode.png)png)

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js
- npm (Node Package Manager)

### Installation

1. **Clone the Repository**

   ```sh
   git clone https://github.com/TomerMenashe/AIEverywhere.git
   cd AIEverywhere
   
2. **Set up the backend**

- **Navigate to the FITA-AIEverywhere directory:**

Install Python dependencies:
npm install

3. **Run the server:**
npm server.js

4. **Access the Application**

 - Open your web browser and navigate to chrome://extensions/.**

 - Enable Developer Mode

 - Enable "Developer mode" by toggling the switch at the top right of the Extensions page.

 - Load Unpacked Extension

 - Click the "Load unpacked" button that appears after enabling Developer mode.

- **Select Extension Directory**

   A file dialog will open. Navigate to the directory where your extension files are located (e.g., AIEverywhere/extension) and select it.


- **Verify Extension Installation**

   Your extension should now appear in the list of installed extensions. Ensure it is enabled by toggling the switch next to it if necessary.


### Usage
Select text on any webpage.
Right-click and choose the desired context menu item:
"Improve English" - improve the sentence like English teach would.
"Improve English - Creative" - same as improve english just more creative.
"Add Comments to Code" - add comments to selected code online.
"Summarize to a Single Paragraph" - summerarize a text to a single paragraph.
"AI Quiz" - generate a quiz on a selected paragrap.


## Project Structure

```plaintext
AIEverywhere/
│
├── extension/
│   ├── background.js
│   ├── content.js
│   ├── manifest.json
│   ├── server.js
│   ├── styles.css
│   └── ...
│
└── README.md
```


### Contributing
Contributions are welcome! Please follow these steps to contribute:

Fork the repository.

Create a new branch for your feature or bugfix.

Commit your changes with clear and descriptive messages.

Push your changes to your forked repository.

Create a pull request to the main repository.

### Author
Tomer Menashe
