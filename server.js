const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pusher = require("pusher");

// import express from "express";

const mongoData = require('./mongoData');

// app config
const app = express()
const port = process.env.port || 4001


// middlewares
app.use(express.json())
app.use(cors())

const pusher = new Pusher({
    appId: "1214565",
    key: "1a7176f1457866160bef",
    secret: "6d4cd69e962ed723ea14",
    cluster: "ap2",
    useTLS: true
  });

//db config
const mongoURI = 'mongodb+srv://admin:HelloWorld@discord-mern.j8h2s.mongodb.net/discordDB?retryWrites=true&w=majority'

mongoose.connect(mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology:true
})

mongoose.connection.once('open',()=>{
    console.log('DB connected');

    const changeStream = mongoose.connection.collection('conversations').watch()

    changeStream.on('change',(change) => {
        console.log('change');
        if(change.operationType === 'insert'){
            console.log('new channel');
            pusher.trigger('channels','newChannel',{
                'change':change
            });
        } else if(change.operationType === 'update') {
            console.log('new message');
            pusher.trigger('conversation', 'newMessage',{
                'change': change
            })
        } else{
            console.log('error in pusher');
        }
    })
})

// api routes
app.get('/',(req,res) => res.status(200).send('hello world'))

app.post('/new/channel', (req, res) => {
    const dbData = req.body

    mongoData.create(dbData, (err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

app.get('/get/channelList',(req, res)=>{
    mongoData.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            let channels = []

            data.map((channelData)=>{
                const channelInfo = {
                    id: channelData._id,
                    name: channelData.channelName
                }
                channels.push(channelInfo)
            })
            res.status(200).send(channels)
        }
    })
})

app.post('/new/message', (req, res)=>{
    const newMessage= req.body

    mongoData.updateMany(
        {_id: req.query.id},
        {$push: {conversation: req.body}},
        (err,data)=>{
            if(err){
                console.log('error saving message ');
                console.log(err);

                res.status(500).send(err)
            } else{
                res.status(201).send(data)
            }

        }
    )
})

app.get('/get/data',(req, res)=>{
    mongoData.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        } else{
            res.status(200).send(data)
        }
    })
})

app.get('/get/conversation',(req, res)=>{
    const id = req.query.id

    mongoData.find({_id: id},(err,data)=>{
        if(err){
            res.status(500).send(err)
        } else{
            res.status(200).send(data)
        }
    })
})





//listen
app.listen(port, ()=>console.log(`listening to port : ${port}`));
