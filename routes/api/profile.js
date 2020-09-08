const express = require('express');
const router = express.Router();

//Route type - GET api/profile
//Description - Test route
//Access - Public

router.get('/',(req,res)=>res.send('Profile route'))

module.exports=router;