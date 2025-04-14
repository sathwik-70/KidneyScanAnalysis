## KidneyScan Analyzer

### Description
KidneyScan Analyzer is a web application designed to assist in the analysis of kidney CT scan images. It leverages AI to predict potential conditions such as cysts, tumors, and stones, providing users with a confidence level and an explanation for each prediction. This tool is intended for informational purposes and should not be used as a substitute for professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.

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
    *   `page.tsx`: Implements the main home page, likely containing the CT scan image upload and analysis interface.
    *   `globals.css`: Provides global CSS styles for the application.
    *   `favicon.ico`: The application's favicon.

### AI Integration

*   **`src/ai/`**: Manages the AI model integration and workflows using Genkit.
    *   `ai-instance.ts`: Handles the instantiation and management of the AI model.
    *   `dev.ts`: Contains configurations specific to the development environment for AI functionalities.
    *   `flows/`: Defines AI workflows for different tasks.
        *   `analyze-ct-scan.ts`: Implements the AI flow for analyzing CT scan images and making predictions.
        *   `generate-analytics.ts`: Manages the generation of analytics related to model performance and data insights.
        *   `process-feedback.ts`: Handles the processing of user feedback on model predictions.

### User Interface Components

*   **`src/components/ui/`**: Houses reusable UI components built with Radix UI and Tailwind CSS.
    *   This directory includes a comprehensive set of components such as `button`, `card`, `input`, `dialog`, `dropdown-menu`, `form`, and many others, providing a consistent and accessible user interface.
    *   Each component (e.g., `accordion.tsx`, `alert-dialog.tsx`, etc.) represents a distinct UI element.

### Other Components

*   **`src/components/icons.ts`**: Defines and exports SVG icons used throughout the application.

### Hooks and Utilities

*   **`src/hooks/`**: Contains custom React hooks for managing application state and interactions.
    *   `use-mobile.tsx`: Provides a hook for detecting whether the application is running on a mobile device.
    *   `use-toast.ts`: Implements a hook for displaying toast notifications to the user.
*   **`src/lib/utils.ts`**: Contains utility functions used across the application for various tasks.

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
    

