const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")('sk_test_51MjQaYCS0nFd3xJn5a8Iqwl3JYAKuZAqIVrhufeZTBGJQQWsm4xI6vq9Q7Po29ZLaiSiBzFptHhUCLZ6ieQStTqg00anQscXi9');

// middle-ware usersunshine1 XiWZWxwFyglcedqE
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://usersunshine1:XiWZWxwFyglcedqE@cluster11.p3hrjaz.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('sunshine').collection('products');
        const reviewCollection = client.db('sunshine').collection('product');
        const bookingsCollection = client.db('sunshine').collection('bookings');
        const paymentCollections = client.db('sunshine').collection('payments');

        app.get('/products', async (req, res) => {
            const query = {};
            const products = await serviceCollection.find(query).toArray();
            res.send(products);
        })

        app.get('/product/:categoryname', async (req, res) => {
            const query = {};
            const product = await reviewCollection.find(query).toArray();
            res.send(product?.filter(n => n.categoryname == req.params.categoryname));
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        app.get('/bookings', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const cursor = bookingsCollection.find(query)
            const bookingss = await cursor.toArray();
            res.send(bookingss)
        })

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query)
            res.send(result)
        })

        app.post("/create-payment-intent", async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amounts = price * 100

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amounts,
                currency: "usd",
                "payment_method_types": [
                    "card"
                ],
                // automatic_payment_methods: {
                //     enabled: true,
                // },
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async(req, res) =>{
            const payment = req.body;
            const result = await paymentCollections.insertOne(payment);
            const id = payment.bookingId;
            const filter = {_id: new ObjectId(id)}
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updateResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })


    }
    finally {

    }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('server is ok')
});

app.listen(port, () => {
    console.log(`running port ${port}`)
});