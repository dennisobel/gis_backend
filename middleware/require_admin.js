export const checkIsAdmin = (req, res, next) => {
    const user = req.user; 
  
    if (user.role === 'admin' || user.role === 'officer') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. User is not authorized.' });
    }
  };
  