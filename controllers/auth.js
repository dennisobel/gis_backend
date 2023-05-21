import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

/** middleware for verify user */
export async function verifyUser(req, res, next) {
  try {
    const { email } = req.method == "GET" ? req.query : req.body;
    console.log("email", email);

    // check the user existance
    let exist = await User.findOne({ email });
    if (!exist) return res.status(404).send({ error: "Can't find User!!!" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

/** POST: http://localhost:5001/api/register 
 * @param : {
  "name" : "example123",-
  "password" : "admin123",
  "email": "example@gmail.com",
  "msisdn": "8009860560",
  "id_number": "27912442",
  "kra_brs_number": "AB17567153",
  "role": "governor",
  "user_type": "resident"
}
*/

// Signup controller
export const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      msisdn,
      id_number,
      user_type,
      kra_brs_number,
      role,
      county_id,
      ministry
    } = req.body;

    // check for existing email
    const existEmail = new Promise((resolve, reject) => {
      User.findOne({ email }, function (err, email) {
        if (err) reject(new Error(err));
        if (email) reject({ error: "Please use unique Email" });

        resolve();
      });
    });

    // check the existing user
    const existID = new Promise((resolve, reject) => {
      User.findOne({ id_number }, function (err, user) {
        if (err) reject(new Error(err));
        if (user) reject({ error: "Please use unique id" });

        resolve();
      });
    });

    Promise.all([existID, existEmail])
      .then(() => {
        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              const user = new User({
                name,
                password: hashedPassword,
                msisdn,
                email,
                id_number,
                user_type,
                kra_brs_number,
                role,
                county_id,
                ministry
              });

              // return save result as a response
              user
                .save()
                .then((result) =>
                  res.status(201).send({ msg: "User Register Successfully", result })
                )
                .catch((error) => res.status(500).send({ error }));
            })
            .catch((error) => {
              return res.status(500).send({
                error: `Unable to hash password, ${error}`,
              });
            });
        }
      })
      .catch((error) => {
        return res.status(500).send({ error });
      });
  } catch (error) {
    res.status(500).json({ message: `Something went wrong, ${error}` });
  }
};

/** POST: http://localhost:5001/api/login 
 * @param: {
  "email" : "example123@host.com",
  "password" : "admin123"
}
*/

// Login controller
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    User.findOne({ email })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({ error: "Don't have Password" });

            const {
              name,
              email,
              password,
              msisdn,
              id_number,
              user_type,
              kra_brs_number,
              role,
              county_id,
              ministry
            } = user;

            // create jwt token
            const token = jwt.sign(
              {
                name,
                email,
                password,
                msisdn,
                id_number,
                user_type,
                kra_brs_number,
                role,
              },
              process.env.JWT_SECRET,
              { expiresIn: "24h" }
            );

            return res.status(200).send({
              msg: "Login Successful...!",
              email: user.email,
              token,
            });
          })
          .catch((error) => {
            return res.status(400).send({ error: "Password does not Match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "email not Found" });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

/** GET: http://localhost:5001/api/user/example123 */
export async function getUser(req, res) {
  const { email } = req.params;
  console.log(email);

  try {
    if (!email) return res.status(501).send({ error: "Invalid email" });

    User.findOne({ email }, function (err, user) {
      if (err) return res.status(500).send({ err });
      if (!user)
        return res.status(501).send({ error: "Couldn't Find the User" });

      /** remove password from user */
      // mongoose return unnecessary data with object so convert it into json
      const { password, ...rest } = Object.assign({}, user.toJSON());

      return res.status(201).send(rest);
    });
  } catch (error) {
    return res.status(404).send({ error: `Cannot Find User Data, ${error}` });
  }
}

/** PUT: http://localhost:5001/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    name: "",
    msisdn: "",
    email: "",
    id_number: "",
    password: "",
    role_id: "",
    user_type: "",
    kra_brs_number: ""
}
*/
export async function updateUser(req, res) {
  try {
    // const id = req.query.id;
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      // update the data
      User.updateOne({ _id: userId }, body, function (err, data) {
        if (err) throw err;

        return res.status(201).send({ msg: "Record Updated...!" });
      });
    } else {
      return res.status(401).send({ error: "User Not Found...!" });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

/** GET: http://localhost:5001/api/generateOTP */
export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:5001/api/verifyOTP */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ error: `Invalid OTP`});
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:5001/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session expired!" });
}

// update the password when we have valid session
/** PUT: http://localhost:5001/api/resetPassword */
export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired!" });

    const { email, password } = req.body;

    try {
      User.findOne({ email })
        .then((user) => {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              User.updateOne(
                { email: user.email },
                { password: hashedPassword },
                function (err, data) {
                  if (err) throw err;
                  req.app.locals.resetSession = false; // reset session
                  return res.status(201).send({ msg: "Record Updated...!" });
                }
              );
            })
            .catch((e) => {
              return res.status(500).send({
                error: "Enable to hashed password",
              });
            });
        })
        .catch((error) => {
          return res.status(404).send({ error: "email not Found" });
        });
    } catch (error) {
      return res.status(500).send({ error });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}
