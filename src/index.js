import dotenv from "dotenv";
import connectDb from "./db/index.js";

dotenv.config({
    path: "./.env"

});

connectDb()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log("Server is running on port", process.env.PORT);
    });
})
.catch(error => console.error(error));










/*
(async() => {
    try {
        await mongoose.connect(`${process.env.MongoDb_URL}\${DB_NAME}`);
        app.on("error",(error) =>{
            console.log("Error connecting to the database", error);
            throw error;
        } );

        app.listen(process.env.PORT, () => {
            console.log("Server is running on port", process.env.PORT);
        })
        

    } catch (error) {
        console.error(error);
        throw error;
    }
})()
*/