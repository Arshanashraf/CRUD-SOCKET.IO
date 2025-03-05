import express from "express"
import mongoose from "mongoose";
import User from "./models/user.model.js"
import http from "http"
import { Server,Socket } from "socket.io";
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})



mongoose.connect("mongodb+srv://arshanashraf2002:jYVzyiTgy5uTddU8@cluster0.0us0t.mongodb.net/Socketio-crud?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Failed", err));

io.on("connection",async (socket)=> {
    console.log(`Client connected: ${socket.id}`)


    const users = await User.find();
    socket.emit(JSON.stringify({type: "INIT", data: users}))
    socket.on("message", async (message) => {
        const {type, data} = JSON.parse(message);

        switch (type) {
            case "CREATE":
                const user = await User.create(data);
                broadcast({type: "CREATE", data: user});
                break;
            
            case "READ":
                const users = await User.find();
                socket.send(JSON.stringify({type: "READ", data: users}));
                break;
            
            case "UPDATE":
                await User.findByIdAndUpdate(data.id, data, {new: true});
                broadcast({type: "UPDATE", data})
                break;

            case "DELETE":
                await User.findByIdAndDelete(data.id);
                broadcast({type: "DELETE", data})
                break;
            
            default:
                console.log("Unknown message type");
                
        }
    });

    socket.on("disconnected", ()=>{
        console.log(`Client Disconnected: ${socket.id}`);
        
    } )
})
function broadcast(message){
    io.emit("broadcast", message)
}

server.listen(4000, ()=> {
    console.log("server running on port 4000");
    
})

    // socket.on("CREATE", async (data, callback) => {
    //     console.log("🔥 Received Data:", data);  // Logging the incoming data
    
    //     try {
    //         const newUser = await User.create(data) // Confirm user is saved
    //         io.emit("userCreated", newUser);
    //         callback({ success: true, users: savedUser });
    //     } catch (error) {
    //         console.error("❌ Error Creating User:", error.message);
    //         callback({ success: false, error: error.message });
    //     }
    // });
    
    // socket.on("READ", async(callback) => {
    //     try {
    //         const users = await User.find()
    //         callback({success: true, users})
    //     } catch (error) {
    //         callback({success: false, error: error.message})
    //     }
    // })
    // socket.on("UPDATE", async({id,updatedData},callback) => {
    //     try {
    //         const user = await User.findByIdAndUpdate(id, updatedData, {new: true})
    //         if(!user) return callback({success: false,error: "User not found"})
    //         io.emit("updatedUSer", user)
    //         callback({success: true, user})
    //     } catch (error) {
    //         callback({success: false, error: error.message})
    //     }
    // })
    // socket.on("DELETE", async(id, callback)=>{
    //     try {
    //         const user = await User.findByIdAndDelete(id)
    //         if(!user) return callback({success: false, error: "User not found"})
    //         io.emit("userDeleted", id)
    //         callback({success: true, id})
    //     } catch (error) {
    //         callback({success: false, error: error.message})
    //     }
    // })