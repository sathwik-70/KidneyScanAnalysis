## KidneyScan Analyzer

### Description
KidneyScan Analyzer is a web application designed to assist in the analysis of kidney CT scan images. It leverages AI to predict potential conditions such as cysts, tumors, stones, and normal, providing users with a confidence level and an explanation for each prediction. This tool is intended for informational purposes and should not be used as a substitute for professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment. Sathwik (sathwikpamu@gmail.com).

### Key Features
*   **Image Upload and Analysis:** Upload CT scan images of kidneys for analysis.
*   **Condition Prediction:** AI-powered prediction of kidney conditions, including normal, cyst, tumor, and stone.
*   **Confidence Level and Explanation:** Provides a confidence score and detailed explanation for each prediction.
*   **Visual Highlighting:** Highlights potential areas of concern on the uploaded image.
*   **Feedback Mechanism:** Allows users to submit feedback on predictions to help improve the model.
*   **Data Analytics and Visualizations:** Comprehensive data visualizations to assess model performance, including:
    *   **Dataset Distribution:** Visualizes the distribution of images across different condition categories.
    *   **Model Training Performance:** Shows training and validation accuracy and loss over epochs.
    *   **Confusion Matrix:** Provides a visual representation of true vs. predicted class labels.
    *   **Classification Report:** Displays precision, recall, F1-score, and support for each class.
    *   **Sample Predictions:** Presents examples of predictions with actual vs. predicted labels.
    *   **ROC Curve:** Evaluates model performance across different thresholds using the Receiver Operating Characteristic curve.
    *   **Inference Time:** Measures the average time taken by the model to analyze an image.

### Project Overview
This document provides a high-level overview of the project structure, key components, and their functionalities.

### Core Application Structure

*   **`src/app/`**: Contains the main application components structured by Next.js routing.
    *   `layout.tsx`: Defines the top-level layout of the application.
    *   `page.tsx`: Implements the main home page, containing the CT scan image upload and analysis interface. This is the main component where users interact with the application, upload images, and view analysis results.
    *   `globals.css`: Provides global CSS styles for the application, including Tailwind CSS configurations and custom CSS variables for theming.
    *   `favicon.ico`: The application's favicon.

### AI Integration

*   **`src/ai/`**: Manages the AI model integration and workflows using Genkit.
    *   `ai-instance.ts`: Handles the instantiation and management of the AI model, including setting up the GoogleAI plugin with the API key.
    *   `dev.ts`: Contains configurations specific to the development environment for AI functionalities, such as importing the flows for CT scan analysis and analytics generation.
    *   `flows/`: Defines AI workflows for different tasks.
        *   `analyze-ct-scan.ts`: Implements the AI flow for analyzing CT scan images and making predictions about kidney conditions. It defines the input and output schemas, the AI prompt, and the logic for analyzing CT scans using the Genkit AI.
        *   `generate-analytics.ts`: Manages the generation of analytics related to model performance and data insights, providing a way to create and display analytics based on prompts.
        *   `process-feedback.ts`: Handles the processing of user feedback on model predictions, allowing the model to refine its analysis based on user input and corrections.

### User Interface Components

*   **`src/components/ui/`**: Houses reusable UI components built with Radix UI and Tailwind CSS.
    *   This directory includes a comprehensive set of components such as `button`, `card`, `input`, `dialog`, `dropdown-menu`, `form`, and many others, providing a consistent and accessible user interface.
    *   Each component (e.g., `accordion.tsx`, `alert-dialog.tsx`, etc.) represents a distinct UI element.

### Other Components

*   **`src/components/icons.ts`**: Defines and exports SVG icons used throughout the application, utilizing the `lucide-react` library for a consistent icon set.

### Hooks and Utilities

*   **`src/hooks/`**: Contains custom React hooks for managing application state and interactions.
    *   `use-mobile.tsx`: Provides a hook for detecting whether the application is running on a mobile device, allowing for responsive UI adjustments.
    *   `use-toast.ts`: Implements a hook for displaying toast notifications to the user, providing feedback and status updates.
*   **`src/lib/utils.ts`**: Contains utility functions used across the application for various tasks, such as the `cn` function for Tailwind CSS class merging.

### Configuration Files

*   **`next.config.ts`**: Configuration file for Next.js, defining routing, build settings, and other Next.js-specific options.
*   **`package.json`**: Manages project dependencies, scripts, and other metadata.
*   **`package-lock.json`**: Records the exact versions of dependencies used in the project.
*   **`tsconfig.json`**: Configures TypeScript compilation options.
*   **`tailwind.config.ts`**: Customizes Tailwind CSS settings, including themes and utility classes.
*   **`postcss.config.mjs`**: Configuration for PostCSS, used for processing CSS with plugins like Tailwind CSS.
*   **`components.json`**: Likely configuration for a component library or style guide.

### Documentation and Development

*   **`README.md`**: The primary documentation file for the project (this file).
*   **`docs/blueprint.md`**: Potentially a blueprint or template for additional documentation.
*   **`.idx/dev.nix`**: Configuration file for the development environment, possibly using Nix.

### Technologies Used
*   React
*   Next.js
*   TypeScript
*   Tailwind CSS
*   Recharts
*   lucide-react
*   Genkit AI

### Setup and Installation

**Prerequisites:**
*   Node.js (>= 18.17.0)
*   npm or yarn

**Installation Steps:**
1.  Clone the repository:
    
git clone https://github.com/your-username/kidneyscan-analyzer.git
    

2.  Navigate to the project directory:
    
cd kidneyscan-analyzer
    

3.  Install dependencies:
    
npm install
    

4.  Set up environment variables:
    *   Create a `.env` file in the root directory.
    *   Add your Google GenAI API key:
    

```
GOOGLE_GENAI_API_KEY=YOUR_API_KEY
```

5.  Run the development server:
    
npm run dev
    

### AI Model Integration
The AI model is integrated using Genkit, which allows for defining AI workflows and prompts directly within the application code. The core AI logic resides in the `src/ai/flows/analyze-ct-scan.ts` file.

#### AI Workflow
1.  **Input:** The application takes a CT scan image URL as input.
2.  **Analysis:** The `analyzeCTScan` function in `src/ai/flows/analyze-ct-scan.ts` calls the Genkit AI flow to analyze the image.
3.  **Prompt:** The AI prompt in `analyzeCTScanPrompt` uses the `analyzeCTScanTool` to get a detailed analysis of the CT scan image, focusing on the kidney's shape, size, and internal structures.
4.  **Prediction:** The AI model predicts the kidney condition (cyst, tumor, stone, or normal) based on the analysis.
5.  **Output:** The function returns the predicted condition, a confidence level, analytics, and an explanation for the choice.

#### Feedback Loop
*   If the confidence level of the prediction is low, the application allows users to submit feedback.
*   The `processFeedback` function in `src/ai/flows/process-feedback.ts` refines the analysis based on the user's feedback, allowing for continuous model improvement.

### Running the Application
To run the application locally, follow these steps:
1.  Ensure you have Node.js and npm installed.
2.  Clone the repository and navigate to the project directory.
3.  Install the dependencies using `npm install`.
4.  Set up the environment variables in a `.env` file.
5.  Run the development server using `npm run dev`.
6.  Open your browser and navigate to http://localhost:9002 to view the application.

### Contributing
Contributions are welcome! Please follow these guidelines:
*   Fork the repository.
*   Create a new branch for your feature or bug fix.
*   Commit your changes with descriptive commit messages.
*   Submit a pull request.

### License
This project is licensed under the [MIT License](LICENSE).
