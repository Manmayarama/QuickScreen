import {clerkClient} from "@clerk/express";
export const protectedAdmin=async (req,res,next)=>{
    try {
       const {userId}=req.auth();
       const user=await clerkClient.users.getUser(userId);
       if(user.privateMetadata.role!=='admin'){
        return res.json({success:false,message:'Access denied'});
       }
         next();
    } catch (error) {
       return res.json({success:false,message:'Access denied'});
    }
} 