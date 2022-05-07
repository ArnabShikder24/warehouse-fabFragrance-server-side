const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleweare
app.use(cors());
app.use(express.json());

function jwtVerify(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.status(401).send({message: 'Unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            return  res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vaw2p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fabCollection = client.db('fabFragrance').collection('inventory');

        // Get Token
        app.post('/getToken', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
               expiresIn: '1d' 
            });
            res.send({accessToken});
        });

        //get all product
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = fabCollection.find(query)
            const product = await cursor.toArray();
            res.send(product);
        });

        //get individual product
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await fabCollection.findOne(query);
            res.send(product);
        });

        // post individual product
        app.post('/inventory', async (req, res) => {
            const newProduct = req.body;
            const result = await fabCollection.insertOne(newProduct);
            res.send(result);
        })

        // Delete individual Product
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await fabCollection.deleteOne(query);
            res.send(result);
        });

        // Update items with put
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const newQantity = req.body.quantity;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    quantity: newQantity
                }
            };
            const result = await fabCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // Restock quantity api
        app.put('/restock/:id', async (req, res) => {
            const id = req.params.id;
            const reStockQuantity = req.body.quantity;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    quantity: reStockQuantity
                }
            };
            const result = await fabCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // get Items with query email
        app.get('/myItem', jwtVerify, async (req, res) => {
            const decodedEmail = req.decoded?.email;
            const email = req.query.email;
           if(email === decodedEmail) {
                const query = {email: email};
                const cursor = fabCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
           }
           else {
                res.status(403).send({message: 'Forbidden access'})
           }
        });
    }
    finally{}
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('assignment 11 server is running...')
});

app.listen(port, () => console.log('server in running this port', port));