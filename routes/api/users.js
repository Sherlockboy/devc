const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');

const User = require('../../models/User');

// @route        POST api/users
// @description  Register user
// @access       Public
router.post('/', [
    body('name', 'Name is required!').not().isEmpty(),
    body('email', 'Please include valid email!').isEmail(),
    body('password', 'Password should be min 6!').isLength({ min:6 })
], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if(user){
            return res.status(400).json({ errors: [{ msg: 'User already exists' }]})
        }
        
        
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return jsonwebtoken
        res.send('User registered')
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;