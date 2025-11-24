#Simple Social Starter /Key Techniques Used

For the Simple Social Starter project, we used several different techniques. 
We used Node.js for the backend runtime environment and Express for routing, middleware, 
and the server framework. For the database and ODM, we used MongoDB and Mongoose to connect our data models to Node.js.

We also converted our HTML files into EJS templates to enable server-side rendering of dynamic HTML views. 
For managing user login state, we used express-session to create and store secure session cookies.

To protect user data and project secrets, we used bcrypt for password hashing and dotenv for loading environment 
variables securely. All sensitive values (such as the MongoDB connection string and session keys) are stored in a .env file, 
which is excluded from the public GitHub repository using .gitignore. I have submitted my .env file separately, as required.

##Technologies breaddown 
1.Backend Tech : Node.js and Express 
2.Data & Data  Models: MongoDB (Mongo Atlas, MongoDB Compass)
3.Views & Rendering : EJS Templates 
4.Authentication & Session : Express-session
5.Security Tech: bcrypt and dotenv.
