import express, { Request, Response, NextFunction } from "express";
import { User } from "../models/User"
const auth_functions = require('../functions/auth_functions');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err: any, decodedToken: any) => {
            if (err) {
                req.app.locals.user = null;
                next();
            }

            try {

                let user: User = await auth_functions.getUserForEmail(decodedToken.email)

                req.app.locals.user = {
                    email: user.email,
                    username : user.username
                }

                next();

            } catch (err) {
                req.app.locals.user = null;
                console.log('checkUser - could not find email in database');
                next();
            }


        })
    } else {
        req.app.locals.user = null;
        next();
    }

};

const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err: any, decodedToken: any) => {

            if (err) {
                console.log('requireUser Error', err)
                res.status(500).json({error: "Authentication Error"}); return;
            }

            const expDateStamp = decodedToken.exp * 1000;
            const currentDateStamp = new Date().getTime();
            const difference = (expDateStamp - currentDateStamp)/1000

            if (difference < 86400 * 5) {
                try {
                    let user: User = await auth_functions.getUserForEmail(decodedToken.email);
                    auth_functions.createAndAddJwtToRes(user.email, user.username, res);
                } catch (err) {
                    //do nothing because token will still be valid
                    // worst case the user just has to sign in after 5 days
                }
            }
            next();

        });
    } else {
        console.log("RequireUser - could not verify JWT");
        res.status(500).json({error: "Authentication Error"}); return;
    }

}

module.exports = {
    checkUser: checkUser,
    requireUser: requireUser,
}