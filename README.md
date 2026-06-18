# 🛒 ShopEZ

ShopEZ is a full stack MERN e-commerce web application built with MongoDB, Express.js, React.js, Node.js, and Vite. The application provides a complete online shopping experience with user authentication, product browsing, category-based filtering, cart management, order handling, and admin product management.

## ✨ Features

- User registration and login
- JWT-based authentication
- Product listing
- Product search and filtering
- Product categories
- Shopping cart functionality
- Order management
- Admin product management
- MongoDB database integration
- REST API integration between frontend and backend
- Responsive user interface

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| API | REST APIs |
| Tools | npm, dotenv, nodemon |

## 📁 Project Structure

```text
ShopEZ/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── package-lock.json
├── PROJECT_DOCUMENTATION.md
├── .gitignore
└── README.md
```

## ⚙️ Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ShopEZ
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```


## ▶️ How to Run Frontend

```bash
cd frontend
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

## 🚀 How to Run Backend

```bash
cd backend
npm run dev
```

Backend will run at:

```text
http://localhost:5001
```

For production:

```bash
npm start
```

## 🔮 Future Enhancements

- Add payment gateway integration
- Add advanced product recommendations
- Improve admin analytics dashboard
- Add order tracking for users
- Add product reviews and ratings
- Add automated testing for frontend and backend
- Deploy frontend and backend to production hosting platforms
