const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')


//Route type - GET api/auth
//Description - Test route
//Access - Public

router.get('/users/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        return res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}); //Route type - POST  api/users
//Description - Authenticate user and get token
//Access - Public

router.post('/auth/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body;

    try {
        //Checking if user exists or not
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }
        //Returning JWT
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 3600
        }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }



});

// router.patch('/users/me', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         res.status(404).send({ error: 'Invalid Updates' })
//     }

//     try {
//         updates.forEach((update) => req.user[update] = req.body[update])
//         await user.save()
//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
//         res.send(req.user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.patch('/users/profile', [
    check('name', 'Name is required')
        .not()
        .isEmpty()], auth, async (req, res) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }
            try {
                let user = await User.findById(req.user.id);
                //console.log(user)
                //console.log(user)
                if (user) {
                    user = await User.findOneAndUpdate({ _id:req.user.id }, {$set: req.body}, { new: true })
                    await user.save();
                    return res.json(user);
                }
            } catch (err) {
                console.error(err.message)
                res.status(500).send('Server Error')
            }
        })

module.exports = router;