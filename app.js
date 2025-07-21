const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

const connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: 'Republic_C207',
database: 'publishers_db'
});

connection.connect((err) => {
if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
}
console.log('Connected to MySQL database');
});



// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});

const upload = multer({ storage: storage });



// Set up view engine
app.set('view engine', 'ejs');

//  enable static files
app.use(express.static('public'));

// enable form processing
app.use(express.urlencoded({
    extended: false
}));


//Default route for publisher table//
app.get('/', (req,res) => {
    const sql = 'SELECT * FROM publishers';
    //Fetch data from MySQL
    connection.query(sql, (error,results) => {
        if (error) {
            console.log('Database query error:', error.message);
            return res.status(500).send('Error Retrieving Publishers');
            
        }
        //Render HTML page with data
        res.render('index', {publishers:results});
    });
});




//Display details of a particular publisher//
app.get('/publishers/:id', (req, res) => {
  // Extract the product ID from the request parameters
  const publisher_id = req.params.id;

  // Fetch data from MySQL based on the publisher ID
  connection.query('SELECT * FROM publishers WHERE publisher_id = ?', [publisher_id], (error, results) => {
      if (error) throw error;

      // Check if any product with the given ID was found
      if (results.length > 0) {
          // Render HTML page with the publishers data
          res.render('publishers', { publishers: results[0]});
      } else {
          // If no product with the given ID was found, render a 404 page or handle it accordingly
          res.status(404).send('Publisher not found');
      }
  });
});




app.get('/login', (req, res) => {
    res.render('login', { messages: req.flash('success'), errors: req.flash('error') });
});




app.get('/addPublisher', (req, res) => {
    res.render('addPublisher');
});

app.post('/addPublisher', upload.single('images'),  (req, res) => {
    // Extract product data from the request body
    const { publisher_name, publisher_address, publisher_country, publisher_contact} = req.body;
    let images;
    if (req.file) {
        images = req.file.filename; // Save only the filename
    } else {
        images = "noImage.png";
    }

    const sql = 'INSERT INTO publishers (publisher_name, publisher_address, publisher_country, publisher_contact, images) VALUES (?, ?, ?, ?, ?)';
    // Insert the new product into the database
    connection.query(sql , [publisher_name, publisher_address, publisher_country, publisher_contact, images], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding publisher:", error);
            res.status(500).send('Error adding publisher');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

app.get('/editPublisher/:id', (req,res) => {
    const publisher_id = req.params.id;
    const sql = 'SELECT * FROM publishers WHERE publisher_id = ?'; 

    connection.query(sql, [publisher_id], (error, results) => { 
        if (error) { 
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving publisher by ID');
            
        }
        
        if (results.length > 0) { 
            res.render('updatePublisher', {product: results[0]}); 
        } else {
            
           res.status(404).send('Publisher not found');
    }
    });
});

app.post('/editPublisher/:id', upload.single('images'), (req, res) => {
    const publisher_id = req.params.id;
    const {publisher_name,publisher_address,publisher_country,publisher_contact} = req.body;
    let images  = req.body.currentImages; 
    if (req.file) { 
        images = req.file.filename; 
    } 

    const sql = 'UPDATE publishers SET publisher_name = ? , publisher_address = ?, publisher_country = ?, publisher_contact =?, images =? WHERE publisher_id = ?';
    // Insert the new product into the database
    connection.query(sql, [publisher_name, publisher_address, publisher_country, publisher_contact, images, publisher_id], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating publisher:", error);
            res.status(500).send('Error updating publisher');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

//Delete route//
app.get('/deletePublisher/:id',(req,res) => {
    const publisher_id = req.params.id;
    //Extract product data from the request body
    const sql = 'DELETE FROM publishers WHERE publisher_id = ?' ;
    //Insert the new product into the database: connection object to talk to db
    connection.query(sql, [publisher_id], (error,results) => { //These 4 info is to be passed to SQL statement, which is why there are 4 question marks//
        if (error) {
            //Handle any error that occurs during the database operation//
            console.error("Error deleting publisher:", error);
            res.status(500).send('Error deleting publisher');

        } else {
            //Send a success response
            res.redirect('/');
        }
    });

});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on URL address : http://localhost:${PORT}/`));

