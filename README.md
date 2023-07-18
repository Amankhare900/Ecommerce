# Ecommerce Project Readme

This is a simple Ecommerce project built with Node.js, Express.js, and MySQL. It provides basic functionality for users to browse products, add items to their cart, and make purchases.

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js and NPM
- MySQL server
- A code editor (e.g., Visual Studio Code)

## Getting Started

1. Clone the repository to your local machine using Git:

```
git clone <repository-url>
```

2. Install the project dependencies:

```
cd <project-directory>
npm install
```

3. Set up the MySQL database:

   - Create a new database in MySQL.
   - Update the `connection` object in `app.js` with your MySQL database credentials and the database name.
   - create the ecommerce database in mysql
   - create three table in it users, products, cart_items
  users schema

  {
    email: varchar,
    username:varchar,
    address: varchar,
    token:int,
    isVerified:int,
    isResetVerified:int,
    password: varchar,
    otp:int,
    isAdmin: int
  }

  product schema
   {
   "id": 1,
   "title": varchar,
   "price": 109.95,
   "description": varchar,
   "discountPercentage": decimal,
   "rating": int,
   "brand": varchar,
    "category" : varchar,
   "images":varchar,
   "stock":int
   },
  cart_items
  {
    id: int,
    product_id:int,
    quantity: int,
    user_id:int,
  }

## Running the Application

To start the application, run the following command:

```
npm start
npm run start
```

The application will be accessible at `http://localhost:3000/product` in your web browser.

## Project Structure

- `app.js`: Main server file containing the application configuration and routes.
- `uploads/`: Directory to store uploaded product images.
- `public/`: Static files like CSS, JavaScript, and EJS templates used for rendering views.
  - `public/Home`: Static files for the homepage.
  - `public/Login`: Static files for the login page.
  - `public/Admin`: Static files for the admin dashboard.
- `methods/emails.js`: Helper function to send emails for verification and password reset.
- `views/`: EJS templates for rendering the frontend.
  - `views/product/`: EJS templates related to product display and cart handling.
  - `views/cart/`: EJS templates for the cart functionality.
  - `views/Admin/`: EJS templates for the admin dashboard.

## Features

- User authentication and account creation with email verification.
- Users can view products and add them to their cart.
- Admin can add, edit, and delete products from the dashboard.
- Users can increase or decrease product quantities in the cart and remove items from the cart.

## Note

This is a basic Ecommerce project and lacks several critical features like payment processing and order management. It is intended as a learning exercise and should not be used in production without proper security enhancements.

## License

This project is open-source. © 2023 Aman Khare. Feel free to use, modify, and distribute the code as per the terms of the license.
