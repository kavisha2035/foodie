const userModel=require('../models/user.model.js')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken');

async function registerUser(req,res){
    try {
        const {fullName,email,password}=req.body;

        if(!fullName || !email || !password){
            return res.status(400).json({message:"All fields (fullName, email, password) are required"});
        }

        const isUserAlreadyExist=await userModel.findOne({email});

        if(isUserAlreadyExist){
            return res.status(400).json({message:"User already exist"});
        }

        const hashPassword = await bcrypt.hash(password,10);

        const user=await userModel.create({fullName,email,password:hashPassword});

        const token=jwt.sign(
            {
                _id:user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        )
        res.cookie("token",token)

        res.status(201).json({
            message:"User registered successfully",
            user:{
                _id:user._id,
                email:user.email,
                fullName:user.fullName,
            } 
        });
    } catch(error) {
        console.error("Register Error:", error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
} 

async function loginUser(req,res){
    try {
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({message:"Email and password are required"});
        }

        const user=await userModel.findOne({email});

        if(!user){
            return res.status(400).json({message:"User not found"});
        }

        const isPasswordValid=await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid password"});
        }

        const token=jwt.sign(
            {
                _id:user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        )
        res.cookie("token",token)

        res.status(201).json({
            message:"User logged in successfully",
            user:{
                _id:user._id,
                email:user.email,
                fullName:user.fullName,
            } 
        });
    } catch(error) {
        console.error("Login Error:", error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

function logoutUser(req,res){
    res.cookie("token")
    res.status(200).json({message:"User logged out successfully"});
    
}
module.exports={registerUser,loginUser} 