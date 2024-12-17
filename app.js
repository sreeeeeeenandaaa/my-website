const express = require('express');
const app = express();
const fs = require('fs');
const bcrypt = require('bcrypt');

// Middleware to parse the incoming request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // This will help to parse JSON bodies

// Handle GET request to render the registration form
app.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/register">
      <input type="text" name="name" placeholder="Enter your name" required><br><br>
      <input type="email" name="email" placeholder="Enter your email" required><br><br>
      <input type="password" name="password" placeholder="Enter your password" required><br><br>
      <button type="submit">Register</button>
    </form>
  `);
});

// Handle POST request for registration
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!password) {
    return res.status(400).send("Password is required");
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error("Error generating salt", err);
      return res.status(500).send("Error generating salt");
    }

    bcrypt.hash(password, salt, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password", err);
        return res.status(500).send("Error hashing password");
      }

      const newUser = { name, email, password: hashedPassword };

      fs.readFile('students.json', (err, data) => {
        if (err) {
          console.error("Error reading file", err);
          return res.status(500).send("Error reading file");
        }

        let students = data ? JSON.parse(data) : [];
        students.push(newUser);

        fs.writeFile('students.json', JSON.stringify(students, null, 2), (err) => {
          if (err) {
            console.error("Error writing file", err);
            return res.status(500).send("Error saving student data");
          }

          res.status(200).send("Student registered successfully");
        });
      });
    });
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
