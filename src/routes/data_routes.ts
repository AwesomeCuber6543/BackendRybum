import express, { Request, Response, NextFunction, Router } from "express";
const router: Router = express.Router();
const data_functions = require('../functions/data_functions');

router.post('/set-data', async (req: Request, res: Response, next: NextFunction) => {
    const data: string = req.body.data;
    const email: string | undefined =  req.app.locals.user.email;

    if (typeof  data !== 'string') {
        res.status(500).json({ error: 'The data must be a string.' }); return;
    }

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        await data_functions.saveData(email, data);
        res.status(200).json({ success: 'The data was submitted.' });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.post('/update-data', async (req: Request, res: Response, next: NextFunction) => {
    const data: string = req.body.data;
    const email: string | undefined =  req.app.locals.user.email;

    if (typeof  data !== 'string') {
        res.status(500).json({ error: 'The data must be a string.' }); return;
    }

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        await data_functions.updateData(email, data);
        res.status(200).json({ success: 'The data was updated.' });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.post('/set-image', async (req: Request, res: Response, next: NextFunction) => {
    const profilepic: string = req.body.profilepic;
    const email: string | undefined =  req.app.locals.user.email;

    if (typeof  profilepic !== 'string') {
        // res.status(500).json({ error: 'The data must be a string.' }); return;
        res.status(500).json({ error: `The data type is ${typeof profilepic}` }); return;
    }

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        await data_functions.saveImage(email, profilepic);
        res.status(200).json({ success: 'The image was submitted.' });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.post('/request-friend', async (req: Request, res: Response, next: NextFunction) => {
    const friendusername: string = req.body.friendsusername;
    const email: string | undefined =  req.app.locals.user.email;

    if (typeof  friendusername !== 'string') {
        // res.status(500).json({ error: 'The data must be a string.' }); return;
        res.status(500).json({ error: `The data type is ${typeof friendusername}` }); return;
    }

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        await data_functions.requestFriend(email, friendusername);
        res.status(200).json({ success: 'The friend request was sent' });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.post('/accept-friend', async (req: Request, res: Response, next: NextFunction) => {
    const friendusername: string = req.body.friendsusername;
    const email: string | undefined =  req.app.locals.user.email;

    if (typeof  friendusername !== 'string') {
        // res.status(500).json({ error: 'The data must be a string.' }); return;
        res.status(500).json({ error: `The data type is ${typeof friendusername}` }); return;
    }

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        await data_functions.acceptFriend(email, friendusername);
        res.status(200).json({ success: 'Friend Request was Accepted' });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.post('/delete-friend', async (req: Request, res: Response, next: NextFunction) => {
    const friendusername: string = req.body.friendsusername;
    const email: string | undefined =  req.app.locals.user.email;

    if (typeof  friendusername !== 'string') {
        // res.status(500).json({ error: 'The data must be a string.' }); return;
        res.status(500).json({ error: `The data type is ${typeof friendusername}` }); return;
    }

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const friendEmail = await data_functions.getEmailFromUsername(friendusername)
        const signedInUsername = await data_functions.getUsernameFromEmail(email)
        await data_functions.deleteFriend(email, friendusername, friendEmail[0], signedInUsername[0]);
        res.status(200).json({ success: 'Friend was Deleted' });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.get('/get-friendrequests', async (req: Request, res: Response, next: NextFunction) => {
    const email: string | undefined =  req.app.locals.user.email;

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const usernameInput = await data_functions.getUsername(email)
        const friendRequestArray = await data_functions.getFriendRequests(usernameInput[usernameInput.length - 1]);
        res.status(200).json({ friendRequests: friendRequestArray });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});



router.get('/get-data', async (req: Request, res: Response, next: NextFunction) => {
    const email: string | undefined =  req.app.locals.user.email;

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const dataArray = await data_functions.getData(email);
        res.status(200).json({ data: dataArray });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});


router.get('/get-image', async (req: Request, res: Response, next: NextFunction) => {
    const email: string | undefined =  req.app.locals.user.email;

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const imageArray = await data_functions.getImage(email);
        res.status(200).json({ profilepic: imageArray });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.post('/get-imagefromusername', async (req: Request, res: Response, next: NextFunction) => {
    const username: string | undefined =  req.body.username;

    if (username === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const email = await data_functions.getEmailFromUsername(username)
        const imageArray = await data_functions.getImage(email[0]);
        res.status(200).json({ profilepic: imageArray });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.get('/get-username', async (req: Request, res: Response, next: NextFunction) => {
    const email: string | undefined =  req.app.locals.user.email;

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const username = await data_functions.getUsername(email);
        res.status(200).json({ username: username });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.get('/get-usernamefromemail', async (req: Request, res: Response, next: NextFunction) => {
    const email: string | undefined =  req.body.email;

    if (email === undefined) {
        res.status(500).json({ error: 'Please give an email' }); return;
    }

    try {
        const username = await data_functions.getUsernameFromEmail(email);
        res.status(200).json({ username: username });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.get('/get-friends', async (req: Request, res: Response, next: NextFunction) => {
    const email: string | undefined =  req.app.locals.user.email;

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const friends = await data_functions.getFriends(email);
        res.status(200).json({ friends: friends });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.get('/get-email', async (req: Request, res: Response, next: NextFunction) => {
    const email: string | undefined =  req.app.locals.user.email;

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const returnedEmail = await data_functions.getEmail(email);
        res.status(200).json({ returnedEmail: returnedEmail });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});



module.exports = router;