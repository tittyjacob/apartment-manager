# Apartment Maintenance Tracker

A comprehensive full-stack application for managing apartment association maintenance charges, payments, and administration.

## 🌟 Features

### Authentication & Authorization
- **Super Admin System**: First admin becomes super admin automatically
- **Admin Approval**: New admin registrations require super admin approval
- **Role-Based Access**: Admin and Resident roles with different permissions
- **JWT Authentication**: Secure token-based authentication

### Admin Features
- **Dashboard**: Overview of total flats, collections, pending dues
- **Flats Management**: Add, edit, delete flat details
- **Monthly Charges**: Set base charges with breakdown (water, security, maintenance, repairs)
- **Dues Management**: View and manage dues by month/year
- **Payment Recording**: Record manual payments with multiple methods
- **Admin Approvals**: Review and approve/reject new admin registrations (super admin only)

### Resident Features
- **Personal Dashboard**: View flat details and payment status
- **Payment History**: Track all past payments
- **Online Payments**: Pay dues using Stripe or Razorpay
- **Current Dues**: View monthly charges with breakdown

### Payment Integration
- **Stripe**: International credit/debit card payments
- **Razorpay**: India-focused (UPI, Cards, Net Banking, Wallets)
- **Dual Gateway**: Users can choose preferred payment method
- **Payment Verification**: Secure signature validation
- **Receipt Generation**: Automatic receipt numbers

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database with Motor (async driver)
- **Pydantic**: Data validation
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Stripe & Razorpay**: Payment gateways

### Frontend
- **React 18**: UI library
- **React Router**: Navigation
- **Tailwind CSS**: Utility-first styling
- **Shadcn/UI**: Beautiful component library
- **Axios**: HTTP client
- **Sonner**: Toast notifications
- **Lucide React**: Icons

### Database
- **MongoDB 7.0**: Document database

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Prerequisites:**
   - Docker & Docker Compose installed

2. **Start the application:**
   ```bash
   chmod +x start-docker.sh
   ./start-docker.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

For detailed Docker instructions, see [README.docker.md](README.docker.md)

### Manual Setup

#### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   Create `.env` file in `backend/` directory:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=apartment_db
   CORS_ORIGINS=*
   STRIPE_API_KEY=sk_test_emergent
   RAZORPAY_KEY_ID=rzp_test_emergent
   RAZORPAY_KEY_SECRET=test_secret_emergent
   JWT_SECRET=your-secret-key
   ```

3. **Start MongoDB:**
   ```bash
   mongod --dbpath /path/to/data
   ```

4. **Run the backend:**
   ```bash
   uvicorn server:app --reload --port 8001
   ```

#### Frontend Setup

1. **Install Node dependencies:**
   ```bash
   cd frontend
   yarn install
   ```

2. **Configure environment variables:**
   Create `.env` file in `frontend/` directory:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

3. **Start the frontend:**
   ```bash
   yarn start
   ```

4. **Access the application:**
   Open http://localhost:3000

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

#### Admin Management
- `GET /api/admin/pending` - Get pending admin approvals
- `POST /api/admin/approve/{user_id}` - Approve admin
- `POST /api/admin/reject/{user_id}` - Reject admin

#### Flats
- `GET /api/flats` - List all flats
- `POST /api/flats` - Create flat
- `PUT /api/flats/{id}` - Update flat
- `DELETE /api/flats/{id}` - Delete flat

#### Charges
- `GET /api/charges` - List monthly charges
- `POST /api/charges` - Set monthly charges

#### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment
- `POST /api/payments/checkout` - Create Stripe checkout
- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify Razorpay payment

#### Dashboard
- `GET /api/dashboard/stats` - Admin dashboard stats
- `GET /api/dashboard/resident` - Resident dashboard data

## 🎨 Design System

### Color Palette
- **Primary**: Deep Forest Green (#1A4D2E)
- **Secondary**: Warm Sand (#F5F5F0)
- **Accent**: Terracotta (#E07A5F)

### Typography
- **Headings**: Manrope (bold, tracking-tight)
- **Body**: Public Sans
- **Code**: JetBrains Mono

### Components
- Built with Shadcn/UI
- Glass-morphism effects
- Smooth animations
- Responsive design

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt
- **JWT Tokens**: Secure authentication
- **Role-Based Access Control**: Admin/Resident permissions
- **Super Admin Approval**: Admin verification system
- **Payment Signature Verification**: Razorpay & Stripe
- **CORS Protection**: Configurable origins
- **Input Validation**: Pydantic models

## 📦 Project Structure

```
apartment-tracker/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend Docker image
│   └── .env                  # Environment variables
├── frontend/
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── ui/          # Shadcn UI components
│   │   ├── pages/           # Page components
│   │   │   ├── Login.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ResidentDashboard.js
│   │   │   ├── FlatsManagement.js
│   │   │   ├── MonthlyCharges.js
│   │   │   ├── Payments.js
│   │   │   ├── DuesManagement.js
│   │   │   ├── AdminApprovals.js
│   │   │   └── PaymentSuccess.js
│   │   ├── utils/
│   │   │   └── api.js       # API client
│   │   ├── App.js           # Main app component
│   │   ├── App.css          # Global styles
│   │   └── index.js         # Entry point
│   ├── package.json         # Node dependencies
│   ├── Dockerfile           # Frontend Docker image
│   ├── nginx.conf           # Nginx configuration
│   └── .env                 # Environment variables
├── docker-compose.yml        # Production Docker setup
├── docker-compose.dev.yml    # Development Docker setup
├── start-docker.sh          # Quick start script
├── README.md                # This file
└── README.docker.md         # Docker documentation
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
yarn test
```

## 🚀 Deployment

### Docker Production Deployment

1. **Update environment variables** in `docker-compose.yml`
2. **Set production API keys** for Stripe and Razorpay
3. **Configure domain** and SSL certificates
4. **Deploy:**
   ```bash
   docker-compose up -d
   ```

### Manual Production Deployment

1. **Backend:**
   - Use gunicorn or uvicorn workers
   - Set up Nginx reverse proxy
   - Configure SSL with Let's Encrypt

2. **Frontend:**
   - Build: `yarn build`
   - Serve with Nginx or CDN

3. **Database:**
   - Use MongoDB Atlas or managed MongoDB
   - Enable authentication
   - Set up backups

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=apartment_db
CORS_ORIGINS=http://localhost:3000
STRIPE_API_KEY=sk_test_your_key
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret
JWT_SECRET=your-secret-key-here
```

#### Frontend (`frontend/.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📝 Usage Guide

### First Time Setup

1. **Register as Admin**: First admin registration automatically becomes super admin
2. **Login**: Use your credentials
3. **Add Flats**: Go to "Manage Flats" and add apartment details
4. **Set Monthly Charges**: Define charges for each month
5. **Manage Dues**: View and track payment status

### For Residents

1. **Register**: Sign up with your flat number
2. **View Dashboard**: See your flat details and dues
3. **Make Payment**: Choose Stripe or Razorpay to pay online
4. **Track History**: View all past payments

### For Admins

1. **Dashboard**: Monitor overall statistics
2. **Manage Flats**: Add/edit flat information
3. **Set Charges**: Define monthly maintenance charges
4. **Record Payments**: Manually record cash/check payments
5. **Manage Dues**: Track pending and paid dues by month

### For Super Admin

1. **All admin features** plus:
2. **Approve Admins**: Review and approve new admin registrations
3. **Reject Admins**: Deny admin access if needed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See LICENSE file for details

## 🐛 Known Issues

- Payment webhooks require public URL for production
- Email notifications not yet implemented

## 🗺️ Roadmap

- [ ] Email notifications for due dates
- [ ] SMS reminders via Twilio
- [ ] PDF receipt generation
- [ ] Expense tracking and reports
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Bulk payment import
- [ ] Advanced analytics dashboard

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check the [Docker documentation](README.docker.md)
- Review API documentation at `/docs`

## 👥 Credits

Built with ❤️ using modern web technologies

---

**Note**: This application uses test API keys for Stripe and Razorpay. Replace with production keys before deploying to production.