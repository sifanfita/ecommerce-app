
import userModel from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';  
import jwt from 'jsonwebtoken';


const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

// the below are controller functions for user route
// route for logging in user
const loginUser = async (req, res) => {

}

// route for signing up user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: 'User already exists'
            });
        }

        // validating email format and password strength
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: 'Please enter a valid email address'
            })
        }
        if (password.length < 8) {
            return res.json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Creating a new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword

        })

        // Saving the user to the database
        const user = await newUser.save();

        // token generation for user to be used for authentication
        const token = createToken(user._id);

        res.json({
            success: true,
            token,
            message: 'User registered successfully',})





    } catch (error) {

        console.log(error);
        res.json({
            success: false,
            message: 'An error occurred while registering the user'
        });
        
    }

    
}

// route for admin login
const adminLogin = async (req, res) => {

}

export {loginUser, registerUser, adminLogin};