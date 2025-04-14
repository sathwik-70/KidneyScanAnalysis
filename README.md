## KidneyScan Analyzer

### Description
KidneyScan Analyzer is a web application designed to assist in the analysis of kidney CT scan images. It leverages AI to predict potential conditions such as cysts, tumors, stones, and normal, providing users with a confidence level and an explanation for each prediction. This tool is intended for informational purposes and should not be used as a substitute for professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment. Sathwik (sathwikpamu@gmail.com).

### Table of Contents
1.  [Introduction](#introduction)
2.  [Getting Started](#getting-started)
3.  [Core Concepts](#core-concepts)
4.  [Usage](#usage)
5.  [AI Model Details](#ai-model-details)
6.  [Data Analytics and Visualizations](#data-analytics-and-visualizations)
7.  [Contributing](#contributing)
8.  [License](#license)
9.  [Troubleshooting](#troubleshooting)
10. [Future Enhancements](#future-enhancements)

### Introduction
This application analyzes CT scan images of kidneys to predict possible conditions including cysts, tumors, stones, and normal states. It returns the prediction with a confidence level and an explanation. This project is for informational purposes only and should not replace professional medical consultation.

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

### Getting Started

#### Prerequisites:
*   Node.js (>= 18.17.0)
*   npm or yarn

#### Installation Steps:
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
    

### Core Concepts

#### Application Architecture
The application follows a Next.js structure with React components for the UI and Genkit for AI functionalities.

#### Main Components
*   **Image Upload:** Allows users to upload CT scan images.
*   **AI Analysis:** Utilizes Genkit flows to analyze the uploaded image.
*   **Result Display:** Presents the predicted condition, confidence level, and explanation.
*   **Visual Highlighting:** Highlights areas of concern on the image.
*   **Data Visualizations:** Displays analytics using Recharts.

#### AI Workflows
The AI workflows are defined using Genkit, which provides a framework for creating AI-powered applications. The main workflow is defined in `src/ai/flows/analyze-ct-scan.ts`.

### Usage

#### Step-by-Step Guides
1.  Upload a CT scan image using the file input.
2.  Click the "Analyze CT Scan" button to trigger the AI analysis.
3.  View the analysis results, including the predicted condition, confidence level, and explanation.
4.  Optionally, provide feedback on the prediction if the confidence level is low.
5.  Review the generated data visualizations for a comprehensive understanding of the analysis.

### AI Model Details

#### Model Training
The AI model is trained on a dataset of kidney CT scan images with annotations for different conditions (normal, cyst, tumor, stone).

#### Evaluation Metrics
The model's performance is evaluated using metrics such as accuracy, precision, recall, F1-score, and AUC. These metrics are displayed in the data visualizations section.

### Data Analytics and Visualizations

#### Dataset Distribution
A bar chart showing the distribution of images across different condition categories.

#### Model Training Performance
Line plots showing the training and validation accuracy and loss over epochs.

#### Confusion Matrix
A heatmap visualizing true vs. predicted class labels.

#### Classification Report
A table displaying precision, recall, F1-score, and support for each class.

#### Sample Predictions
A grid of test images showing predicted vs actual labels, with color-coded titles (green = correct, red = incorrect).

#### ROC Curve
A ROC curve showing performance across different thresholds and the AUC (Area Under Curve) value.

#### Inference Time
A bar chart showing the average time taken to classify a single image.

#### Grad-CAM Heatmaps (Optional)
Visual explanations of which part of the image the model focused on to make its prediction.

### Contributing

#### Contribution Guidelines
1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Commit your changes with descriptive commit messages.
4.  Submit a pull request.

### License
This project is licensed under the [MIT License](LICENSE).

### Troubleshooting

#### Common Issues and Solutions
*   **Issue:** The application fails to analyze the CT scan image.
    *   **Solution:** Ensure the CT scan URL is valid and accessible.
*   **Issue:** The AI model provides inaccurate predictions.
    *   **Solution:** Provide feedback on the prediction to help improve the model.
*   **Issue:** The data visualizations are not displaying correctly.
    *   **Solution:** Check the browser console for any JavaScript errors and ensure all dependencies are installed correctly.

### Future Enhancements

#### Potential Future Features and Improvements
*   Incorporate additional data sources to improve model accuracy.
*   Implement a user authentication system to allow users to save their analysis history.
*   Develop a mobile app version of the application.
*   Add support for additional image formats and modalities.
*   Provide more detailed explanations for the model's predictions, including visual highlighting of relevant features.

