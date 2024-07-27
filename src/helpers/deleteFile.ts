import fs from "fs";
export function deleteFile(FilePath:string){
    try{
        fs.unlinkSync(FilePath);
    }
    catch(err){
        console.log("ERROR WHILE DELETING FILE");
    }
}