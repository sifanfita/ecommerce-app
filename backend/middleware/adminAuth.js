import jwt from 'jsonwebtoken';

const adminAuth = (req, res, next) => {
    try {

        const { token } = req.headers;
        if (!token) {
            return res.json({
                success: false,
                message: 'Not authorized to access this resource'
            });
        }
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded_token !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({
                success: false,
                message: 'Not authorized to access this resource'
            });
        }

        // if everything is good, proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: 'An error occurred while authenticating the admin'
        });
    }

}

export default adminAuth;