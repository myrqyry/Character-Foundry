# The Character Foundry

## Project Description

The Character Foundry is a web application designed to help users create and manage detailed fictional characters. It leverages the power of AI, specifically Google's Gemini API, to generate rich character descriptions, backstories, and other attributes, streamlining the creative process for writers, game developers, and role-playing enthusiasts.

## Key Features

*   **AI-Powered Character Generation**: Utilize the Gemini API to generate detailed character profiles, including names, backstories, personality traits, and physical descriptions.
*   **Character Profile Management**: Create, edit, and organize multiple character profiles.
*   **Intuitive User Interface**: Built with React and styled with Tailwind CSS for a clean and responsive user experience.
*   **Environment Configuration**: Uses Vite for efficient development and building.
*   **API Integration**: Seamless integration with Google's Generative AI.

## Tech Stack

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **AI Integration**: Google Gemini API (`@google/genai`)

## Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/myrqyry/character-foundry.git
    cd character-foundry
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure Environment Variables**:
    Create a `.env.local` file in the root of the project and add your Google Gemini API key:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
    Replace `YOUR_GEMINI_API_KEY` with your actual API key obtained from Google AI Studio.

## Usage Instructions

1.  **Start the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  **Open in Browser**: The application will typically be available at `http://localhost:5173` (or another port if Vite chooses differently).
3.  **Create Characters**: Navigate to the application to start creating new characters. Use the AI enhancement feature to generate detailed attributes.
4.  **Manage Profiles**: Save, edit, and organize your character profiles as needed.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
