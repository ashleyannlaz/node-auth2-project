const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require("./auth-middleware");
const { JWT_SECRET } = require("../secrets");
const Users = require("../users/users-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function buildToken(user) {
  
  const payload = {
    subject: user.user_id,
    username: user.username,
    role_name: user.role_name,
  };
  console.log(payload)
  const options = {
    expiresIn: "1d",
  };
  const token = jwt.sign(payload, JWT_SECRET, options)
  return token
}

router.post("/register", validateRoleName, async (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
  
  const {username, password} = req.body
  const {role_name} = req
  const hash = bcrypt.hashSync(password,8)
  Users.add({username, password: hash, role_name})
  .then(noidea => {
    res.status(201).json(noidea)
  })
  .catch(next)
  

});

router.post("/login", checkUsernameExists, (req, res, next) => {
  // let { username, password } = req.body;
  if (bcrypt.compareSync(req.body.password, req.user.password)) {
    const token = buildToken(req.user)
    res.status(200).json({
      message: `${req.user.username} is back!`,
      token,
    })

  } else {
    next({status:401, message: 'Invalid credentials'})
  }


  // Users.findBy({ username })
  //   .then(([user]) => {
  //     if (user && bcrypt.compareSync(password, user.password)) {
  //       const token = buildToken(user);
  //       res.status(200).json({
  //         message: `${user.username} is back!`,
  //         token,
          
  //         subject: user.role_id,
  //         username: user.username,
  //         role_name: user.role_name
          
  //       });
  //     } else {
  //       next({ status: 401, message: "Invalid credentials" });
  //     }
  //   })
  //   .catch(next);

  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
});

module.exports = router;
