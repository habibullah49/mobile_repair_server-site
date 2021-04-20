const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()
const port = process.env.PORT || 9000;
console.log(process.env.DB_USER);

app.use(cors())    
app.use(bodyParser.json())  

const fileUpload = require('express-fileupload');
app.use(express.static('picture')); 
app.use(fileUpload());
const ObjectId = require('mongodb').ObjectId

app.get("/", (req, res) => {
  res.send("Hello World!");
});



const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ev8gs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log("database connected",err);
  const collection = client.db("service").collection("serviceCollection");
  const BookCollection = client.db("service").collection("Book");
    const reviewCollection = client.db("service").collection("review");
    const adminCollection = client.db("service").collection("admin");


    app.post('/addService', (req, res) => {
        const file = req.files.file  
        const price = req.body.price
        const title = req.body.title
        const description = req.body.description

        console.log(price, title, description, file);


        const filePath = `${__dirname}/doctors/${file.name}`
        file.mv(filePath, (err) => {
            if (err) {
                res.status(500).send({ msg: "failed to upload" });
            }
            
        });

        const newImg = file.data;
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ price, title, description, image })
            .then(result => {
                fs.rm(filePath, err => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ msg: "failed to upload" })
                    }
                    res.send(result.insertedCount > 0);



                })
            })
    })

    app.get('/service', (req, res) => {
       
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/service/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    app.post('/addBooking', (req, res) => {    
        const book = req.body
        BookCollection.insertOne(book)
            .then(result => {

               
                console.log(result);
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/getBooking', (req, res) => {
        BookCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })



    app.get('/bookCollection', (req, res) => {
        console.log(req.query.email);
        BookCollection.find({ email: req.query.email })
            .toArray((err, items) => {
                console.log(items)
                res.send(items)
            })

    })
    app.post('/addReview', (req, res) => {    
        const order = req.body
        console.log(order);
        reviewCollection.insertOne(order)
            .then(result => {

               
                console.log(result);
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/addReview', (req, res) => {    
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    })

   
    app.post('/makeAdmin', (req, res) => {
        const user = req.body;
        console.log(user);
        adminCollection.insertOne(user)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                console.log("admin check", admins)
                res.send(admins.length > 0)
            })
    })



})

app.get('/', (req, res) => {
    res.send('hello world')
})
app.listen(port)
  

