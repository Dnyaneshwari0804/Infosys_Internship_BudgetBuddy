#  BudgetBuddy: Intelligent Student Budget Planning Platform

> A full-stack personal finance management platform designed to help students track expenses, manage budgets, set savings goals, and visualize their financial habits through a modern, interactive dashboard.

 Developer: Dnyaneshwari  
 Branch: `dnyaneshwari-budgetbuddy`  
 Organization:Infosys Internship Project  

---

##  Project Status: Ahead of Schedule
While the current phase required Milestone 1 (Backend setup, Database Design, and JWT Authentication), I have successfully implemented the core features of **Milestones 1 through 4** to deliver a fully functional, end-to-end application.

---

##  Key Features Implemented

###  1. Secure Authentication (Milestone 1)
*   **Custom User Model:** Extended Django's `AbstractUser` to support distinct roles (Student, Premium, Admin).
*   **JWT Authentication:** Implemented secure token-based login/registration using `djangorestframework-simplejwt`.
*   **Protected Routes:** Backend APIs and React frontend routes are strictly guarded, ensuring data privacy.

###  2. Expense & Income Tracking (Milestone 2)
*   **Full CRUD Operations:** Users can seamlessly Add, View, Edit, and Delete their financial records.
*   **Categorization:** Transactions are categorized (Food, Travel, Education, etc.) for better organization.
*   **Data Privacy:** Backend logic ensures users can only fetch their own data (`queryset = request.user.expenses.all()`).

###  3. Advanced Analytics Dashboard (Milestone 3 & 4)
*   **Interactive Charts:** Integrated **Recharts** to visualize spending habits.
    *   *Bar Chart:* Real-time comparison of Income vs. Expenses.
    *   *Donut Chart:* Category-wise breakdown of expenses.
*   **Financial Summaries:** Auto-calculated metrics for Total Income, Total Expenses, and Net Savings.

###  4. Budgets & Savings Goals (Milestone 3)
*   **Goal Tracking:** Create savings goals with target amounts and deadlines.
*   **Dynamic Progress Bars:** Visual representation of goal completion percentages.
*   **Monthly Budgets:** Set limits and monitor utilization.

###  5. Reports & Notifications (Milestone 4)
*   **CSV Export:** Backend API generates and downloads a complete expense report.
*   **Smart Alerts:** Backend logic triggers a notification automatically if an expense exceeds a certain threshold (e.g., >$500).

---

##  Technology Stack

**Frontend:**
*   ⚛️ React.js (Vite)
*   🎨 Tailwind CSS (Modern Dark Mode UI)
*   📈 Recharts (Data Visualization)
*   📡 Axios (API Communication)

**Backend:**
*   🐍 Python & Django
*   🛠️ Django REST Framework (DRF)
*   🔑 SimpleJWT (Authentication)
*   🗄️ SQLite (Local Development) / Ready for PostgreSQL

---

## 📂 Project Structure

```text
BudgetBuddy-AI-Tool/
│
├── backend/            # Django REST API
│   ├── config/         # Settings & URL routing
│   ├── core/           # Models, Views, Serializers
│   └── manage.py
│
├── frontend/           # React Application
│   ├── src/            # Components, App.jsx
│   └── index.html
│
├── .gitignore          # Protects sensitive/heavy files (venv, node_modules)
└── README.md