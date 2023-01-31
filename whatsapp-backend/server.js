//importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

// app config
const app = express();
const port = process.env.PORT || 5000;




const pusher = new Pusher({
  appId: "1544885",
  key: "7031d8d889734f9dce9d",
  secret: "a58d00c69a2f519bfcd2",
  cluster: "ap2",
  useTLS: true
});




//middleware
app.use(express.json());
app.use(cors());


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});


//DB config
const connection_url ="mongodb+srv://start:1mx3xx1HoANYh0Zu@cluster0.wjgr4t4.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
    userCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection

db.once('open', () => {
    console.log("DB connected");

    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log('change: ',change);

        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received : messageDetails.received
            });
        } else {
            console.log("Error triggering Pusher");
        }
    })
})




// api routes
app.get('/',(req,res) => res.status(200).send('Hello World'));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => { 
    
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})



// listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));






//kvlOifN95gGT5Dkg
//ugYtLFT3hcBeE7w8
//mongodb+srv://start:ugYtLFT3hcBeE7w8@cluster0.wjgr4t4.mongodb.net/whatsappdb?retryWrites=true&w=majority
//1mx3xx1HoANYh0Zu
//mongodb+srv://start:1mx3xx1HoANYh0Zu@cluster0.wjgr4t4.mongodb.net/?retryWrites=true&w=majority
//mongodb+srv://admin:${dbConfig.dbPass}@cluster0.oozha.mongodb.net/${dbConfig.dbName}?retryWrites=true&w=majority`