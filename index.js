const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sys040z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


const jobsCollection = client.db('jobPortal').collection('jobs');
const applicationsCollection = client.db('jobPortal').collection('applications');


// applications API

app.get('/applications', async(req, res) => {
    const email = req.query.email;

    const query = {
      userEmail: email
    }
    const result = await applicationsCollection.find(query).toArray();

    // bad way 
    for(let application of result) {
        const jobId = application.jobId
        const jobQuery = {_id: new ObjectId(jobId)};
        const job = await jobsCollection.findOne(jobQuery);
        application.company = job.company;
        application.title = job.title;
        application.company_logo = job.company_logo;
    }

    res.send(result);
})

app.post('/applications', async(req, res) => {
    const application = req.body;
    const result = await applicationsCollection.insertOne(application);
    res.send(result);
})

// jobs API
app.get('/jobs', async(req, res) => {
    const result = await jobsCollection.find().toArray();
    res.send(result);
})

// jobs details
app.get('/jobs/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await jobsCollection.findOne(query);
    res.send(result);
})

app.get('/', (req, res) => {
    res.send('Welcome to the API!');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
