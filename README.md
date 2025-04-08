# 🎓 TutorTech: AI-Powered Learning Assistant

TutorTech is a modern AI-powered learning platform designed to enhance student education through personalized feedback, smart grading, course modules, and contextual chatbot support. Developed for NAU’s Metrology Research and Teaching Laboratory (MRTL), TutorTech blends traditional learning content with advanced AI capabilities to provide a smarter, more tailored educational experience.

---

## 👨‍💻 Developers

- **Chase Babb**
- **Ryley Fernandez**
- **Faith Ononye**
- **Shurie Kamewada**

---

## 👥 Clients

**Northern Arizona University — Metrology Research and Teaching Laboratory (MRTL)**  
TutorTech was built in collaboration with MRTL to serve as an interactive tutor and intelligent grading assistant for university-level coursework.

---

## 🌐 Live Demo

🔗 **App**: [https://tutor-tech.vercel.app/](https://tutor-tech.vercel.app/)

🔗 **Repo**: [cmb2333/tutortech](https://github.com/cmb2333/tutortech)

---

## 🧩 Features

### 🔐 User System
- Secure login / signup with session cookies
- Profile updates (name, email)
- Password change support
- Toggle for chat history + semantic search

### 🎛️ Personalization
- Learning Style Quiz: tailor AI tone and depth
- Preferences:
  - Response length: Short or Long
  - Guidance: Step-by-step or Real-world examples
  - Value: Process vs Direct Answers

### 🏠 Dashboard
- Welcome message and profile card
- Custom learning style entry
- Enrolled course view
- Toggle: Enable/disable chat history and Qdrant vector search

### 📚 Courses & Lectures
- Course-specific dashboards
- Embedded YouTube lecture videos
- Navigation between lectures, assignments, and grades

### 📝 Assignments & Grading
- Multiple choice, text, and true/false support
- AI grading for free-response questions
- Instant results and scoring breakdown
- "Explain" button for AI-generated feedback

### 💬 AI Chatbot
- 4 learning personas: `Tutor`, `Mentor`, `Co-Learner`, `Custom`
- Contextual responses powered by:
  - Recent chat memory (Qdrant)
  - Semantic search
  - Conversation pairing for vague prompts
- Built-in explanation generation via OpenAI GPT-4o

### 📊 Grades View
- Assignment-based grade tracking
- Course-specific breakdown

### 📞 Contact Us
- Users can submit a message to the system administrator via email for help or technical issues

---

## 🛠️ Technologies Used

### Frontend
- React.js
- React Bootstrap
- React Router
- AOS (Animate on Scroll)

### Backend
- Flask (Python)
- PostgreSQL
- Qdrant (vector DB)
- OpenAI GPT-4o
- psycopg2
- CORS & cookie management

### Hosting
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: PostgreSQL on Render
- **Vector DB**: Qdrant Cloud

---

## ⚙️ How It Works

1. User logs in or signs up
2. Personalized dashboard loads with enrolled courses
3. User navigates to a course → views lectures or takes assignments
4. Free-response answers are graded using GPT-4o
5. Students can ask for explanations powered by AI
6. AI responses are context-aware when history is enabled

---

## 🧩 Challenges

| Area                | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| 🔐 Hosting & Sessions | Secure session persistence across domains and CORS policy alignment         |
| 🧠 AI Context         | Context tuning with Qdrant (semantic + recent history) for smart responses  |
| 🤖 Feature Complexity| Multi-mode chat + AI grading + user preferences = high integration effort   |
| 🗃️ DB Integration     | PostgreSQL schema supports preferences, history, grades, and assignments     |
| 🎨 UI/UX Design       | Responsive, intuitive layout using AOS animations and modular components    |

---

## 💡 Good To Know

- Context-aware AI can be turned off for performance or privacy
- TutorTech is extendable to multiple courses or even other institutions
- Learning preferences shape AI behavior on a per-user basis
- Scalable architecture using microservices and vector search

---

## 📄 License

This project is for educational purposes and may be adapted under appropriate university or institutional licensing.
