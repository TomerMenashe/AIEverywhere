# AIEverywhere Chrome Extension

Welcome to the AIEverywhere Chrome Extension project! This extension enhances your browsing experience by providing multiple AI-powered functionalities through the context menu.

## Project Overview

This project comprises two main stages:

1. **HighlightTextInYellow**: A simple extension to highlight selected text in yellow.
2. **AIEverywhere**: An advanced extension utilizing the OpenAI ChatGPT API to offer various context menu items for text improvement, code commenting, summarization, and quiz generation.

## Features

- **HighlightTextInYellow**: Highlights selected text in yellow upon right-clicking.
- **Improve English**: Enhances the level of English of the selected text.
- **Improve English - Creative**: Enhances the English of the selected text with a creative twist.
- **Add Comments to Code**: Adds comments to the selected code.
- **Summarize to a Single Paragraph**: Summarizes the selected text into a single paragraph.
- **AI Quiz**: Generates a quiz with multiple-choice questions about the selected text.

## Screenshots

### HighlightTextInYellow
![HighlightTextInYellow](https://github.com/TomerMenashe/AIEverywhere/blob/main/screenshots/HighlightTextInYellow.png)

### AIEverywhere Context Menu
![AIEverywhere Context Menu](https://github.com/TomerMenashe/AIEverywhere/blob/main/screenshots/ContextMenu.png)

### Quiz Example
![Quiz Example](https://github.com/TomerMenashe/AIEverywhere/blob/main/screenshots/QuizExample.png)

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

Navigate to the price-checker-api directory:
cd price-checker-api

Install Python dependencies:
pip install -r requirements.txt

Run the FastAPI server:
uvicorn main:app --reload

3. **Set up the backend**

Open a new terminal and navigate to the price-comparison-app directory:
cd price-comparison-app

Install Node.js dependencies:
npm install

Run the Next.js development server:
npm run dev

4. **Access the Application**

Open your web browser and navigate to http://localhost:3000.

### Usage
Enter the product name in the search bar and click "Search".
View the comparison table with prices from BestBuy, Walmart, and Newegg.
Click on the product names to be redirected to the respective product pages on each site.


## Project Structure

```plaintext
price-comparison-page/
│
├── price-checker-api/
│   ├── main.py
│   ├── scrapers/
│   │   ├── bestbuy_scraper.py
│   │   ├── walmart_scraper.py
│   │   └── newegg_scraper.py
│   ├── requirements.txt
│   └── ...
│
├── price-comparison-app/
│   ├── pages/
│   │   ├── index.js
│   │   └── ...
│   ├── package.json
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

### Authors
Tomer Menashe
