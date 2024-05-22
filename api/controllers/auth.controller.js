import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const Signup = async(req,res,next)=>{
    const {username, email, password} = req.body;

    if(!username || !email || !password ||
        username === '' || email === '' || password === ''){
        next(errorHandler(400, "All fields are Required"))
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
        username, 
        email, 
        password: hashedPassword,
    });

    try {
        await newUser.save()
        res.json(newUser)

    } catch (error) {
        next(error)
    }
}

export const Login = async(req,res,next)=>{
    const {email, password} = req.body;

    if(!email || !password || email === '' || password === ''){
        next(errorHandler(400, 'All fields are required'));
    }

    try {
        const validUser = await User.findOne({email});
        if(!validUser){
            return next(errorHandler(400, 'User not found'))
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if(!validPassword){
            return next(errorHandler(400, 'Invalid Password'));
        }

        const token = jwt.sign({id: validUser._id, isAdmin: validUser.isAdmin}, process.env.JWT_SECRET);
        
        const {password: pass, ...rest} = validUser._doc;

        res.status(200).cookie('Access_Token', token, {httpOnly: true}).json(rest)

    } catch (error) {
        next(error)
    }


}

export const signinWithGoogle = async(req,res,next)=>{
    const {username, email, profilePhoto} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user){
            const token = jwt.sign({id: user._id, isAdmin: user.isAdmin}, process.env.JWT_SECRET)
            const {password, ...rest} = user._doc;
            res.status(200).cookie('access_token', token, {
                httpOnly: true,
            }).json(rest);
        }else{
            const generatedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: username.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
                email,
                password: hashedPassword,
                profilePhoto
            });
            await newUser.save();
            const token = jwt.sign({id: newUser._id, isAdmin: newUser.isAdmin}, process.env.JWT_SECRET)
            const {password, ...rest} = newUser._doc;
            res.status(200).cookie('access_token', token, {
                httpOnly: true,
            }).json(rest);

        }
    } catch (error) {
        next(error.message)
    }
}