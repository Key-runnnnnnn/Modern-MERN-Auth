import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

//  Signup controllers
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Welcome to our platform",
      text: `Hello ${name}, welcome to our platform`,
      html: `<p>Hello ${name}, your account is successfully created on our platform using Email ID: ${email}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      response: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// login Controllers
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Login success",
      response: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Logout Controllers
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Send varification opt to req user
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId)

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account is already verified"
      })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));// 6 digit otp will be generated

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // otp will expire after 10 minutes

    await user.save();

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "Account Verification otp ",
      text: `Hello, welcome to our platform`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });

    return res.json({
      success: true,
      message: "Otp sent successfully",
      otp: otp
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}


// Email verification
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "Please provide missing details"
    })
  }

  try {

    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User Not Found"
      })
    }

    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid otp"
      })
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "otp is expired. Resend it again"
      })
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Email verified Successfully"
    })

  } catch (error) {
    return res.json({
      success: false,
      message: "Internal server error"
    })
  }
}


// Check if user is authenticated ot not
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "User is authenticated"
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}


// Send password reset otp to user
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      success: false,
      message: "Please provide email Id"
    })
  }
  try {
    const user = await User.findOne({ email });

    if(!user){
      return res.json({
        success: false,
        message: "This Email Id is not registered with us. Please enter registered Email Id"
      })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));// 6 digit otp will be generated

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // otp will expire after 10 minutes
    await user.save();

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Password Reset otp ",
      text: `Hello, welcome to our platform`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });

    return res.json({
      success: true,
      message: "Otp sent successfully",
      otp: otp
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}


// User can reset the password and reset the password
export const resetpassword = async (req,res)=>{

  const {email,otp,newPassword} = req.body;
  if(!email || !otp || !newPassword){
    return res.json({
      success: false,
      message: "Please provide missing details"
    })
  }

  try {
    const user = await User.findOne({ email });
    if(!user){
      return res.json({
        success: false,
        message: "This Email Id is not registered with us. Please enter registered Email Id"
      })
    }

    if(user.resetOtp === '' || user.resetOtp !== otp){
      return res.json({
        success: false,
        message: "Invalid otp"
      })
    }

    if(user.resetOtpExpireAt < Date.now()){
      return res.json({
        success: false,
        message: "otp is expired. Resend it again"
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully"
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
    
  }
}