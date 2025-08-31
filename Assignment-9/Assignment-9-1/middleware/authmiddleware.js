const jwt = require("jsonwebtoken");

const authmiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if(! authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"Unauthrised not token provided"});
    }
    const token = authHeader.split(" ")[1];
    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decode;
        next();
        
    } catch (error) {
        res.status(401).json({message:"Unauthorized: Invalid Token"})
    }
}

module.exports = authmiddleware;