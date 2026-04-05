# 🚗 EliteAuto: AI-Powered Dealership Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)

EliteAuto is a state-of-the-art microservices-based Dealership Management System. It goes beyond standard inventory management by integrating **Machine Learning** and **Generative AI** to act as a virtual salesman, marketing assistant, and data analyst.

## ⚠️ Important Note: Machine Learning Models
Due to GitHub's file size limitations, the trained Machine Learning model files (`.pkl` files) are not included in this repository. 
👉 **[https://drive.google.com/drive/folders/1RfYNz_Wla35mRT_UtcCcYY4Bhdn435gF?usp=sharing]**
*Please download the model files from the link above and place them inside the `ai-service/` folder before running the Python server.*

---

## ✨ Key AI Features
* **🤖 Smart Negotiator Chatbot:** Powered by Google Gemini 2.5 Flash. It references live database inventory, compares vehicle specs, and bargains dynamically without going below the "secret minimum price".
* **🔮 AI Price Predictor:** A trained Random Forest Regression model (`Scikit-Learn`) that accurately predicts the real-time market value of a vehicle based on its specs.
* **🔥 Hot Lead Scorer:** Analyzes live chat intents to flag high-potential buyers and alerts admins in real-time.
* **🕵️ Auto Data Extraction Agent:** Paste any raw social media text ad, and the AI extracts structured details (Brand, Model, Price, Year) to auto-fill the listing form.
* **📄 Dynamic PDF Brochures:** Generates punchy marketing descriptions and compiles them with vehicle specs into downloadable PDF brochures using `ReportLab`.
* **📱 Auto Social Media Marketer:** One-click generation of engaging Facebook/Instagram captions with emojis and hashtags.

## ⚙️ Core System Features
* **Role-Based Access Control (RBAC):** Distinct permissions for Admins, Sellers, and Guests.
* **Advanced Inventory Management:** Full CRUD operations with multi-image upload capabilities.
* **Real-Time Analytics Dashboard:** View total inventory, market worth, system users, and active leads.
* **Modern UI/UX:** Built with Tailwind CSS featuring a fully integrated Dark/Light mode, custom galleries, and interactive toast notifications.

---

## 🏗️ System Architecture & Tech Stack
The project is divided into three main microservices:

1. **Frontend (`/frontend`)**: React.js, Tailwind CSS, Vite.
2. **Backend (`/backend`)**: Java, Spring Boot, MySQL (RESTful APIs, Security, Data Persistence).
3. **AI Service (`/ai-service`)**: Python, Flask, Scikit-Learn, Pandas, Google Generative AI (Gemini), ReportLab.

---

## 🚀 How to Run the Project Locally

### 1. Setup the Backend (Spring Boot)
1. Navigate to the `backend` folder.
2. Configure your MySQL database settings in `src/main/resources/application.properties`.
3. Run the application using your IDE (IntelliJ IDEA) or Maven:
   ```bash
   mvn spring-boot:run

###2. Setup the AI Service (Python/Flask)
1.Navigate to the ai-service folder.
2.Ensure you have downloaded the .pkl files and placed them in this folder.
3.Open app.py and replace GOOGLE_API_KEY with your actual Gemini API key.
4.Install dependencies and run the server:
pip install -r requirements.txt
python app.py

### 3. Setup the Frontend (React)
Navigate to the frontend folder.
Install Node modules and start the development server:
npm install
npm run dev

Open your browser and go to the provided localhost URL
(usually http://localhost:5173).

Built with ❤️ for the future of Automotive Dealerships.
