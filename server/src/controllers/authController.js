import { auth } from "../config/firebase.js"
import User from "../models/User.js"
class authController {
  static async user_post(req, res) {
    try {
      // Verify authentication
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const token = authHeader.split("Bearer ")[1]
      const decodedToken = await auth.verifyIdToken(token)

      // Get user from Firebase
      const userRecord = await auth.getUser(decodedToken.uid)

      // Check if user exists in MongoDB
      let user = await User.findOne({ uid: userRecord.uid })

      if (user) {
        // Update existing user
        user.email = userRecord.email || ""
        user.displayName = userRecord.displayName || "User"
        user.photoURL = userRecord.photoURL || ""
        user.updatedAt = new Date()
        await user.save()
      } else {
        // Create new user
        user = new User({
          uid: userRecord.uid,
          email: userRecord.email || "",
          displayName: userRecord.displayName || "User",
          photoURL: userRecord.photoURL || "",
        })
        await user.save()
      }

      return res.status(200).json({ user })
    } catch (error) {
      console.error("User sync error:", error)
      return res.status(500).json({ message: "Failed to sync user data" })
    }
  }

  static async verify_token_post(req, res) {
    try {
      const { token } = req.body
      if (!token) {
        return res.status(400).json({ message: "Token is required" })
      }

      const decodedToken = await auth.verifyIdToken(token)
      return res.status(200).json({ user: decodedToken })
    } catch (error) {
      console.error("Token verification error:", error)
      return res.status(401).json({ message: "Invalid token" })
    }
  }

  static async admin_verify(req, res) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const token = authHeader.split("Bearer ")[1]

      // Verify token with Firebase
      const decodedToken = await auth.verifyIdToken(token)

      // Check if user exists in our database
      const user = await User.findOne({ uid: decodedToken.uid })

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Check if user has admin role
      console.log(user)
      if (user.isAdmin === 0) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." })
      }

      // If user is admin, return success
      return res.status(200).json({
        message: "Admin verification successful",
        isAdmin: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.role
        }
      })
    } catch (error) {
      console.error("Admin verification error:", error)
      return res.status(401).json({ message: "Invalid or expired token" })
    }
  }

  static async user_get(req, res) {
    try {
      const { uid } = req.params
      console.log(uid)
      // Get user from MongoDB
      const user = await User.findOne({ uid })
      console.log("User is found")
      if (!user) {
        // If not in MongoDB, try to get from Firebase
        const userRecord = await auth.getUser(uid)
        return res.status(200).json({ user: userRecord })
      }

      return res.status(200).json({ user })
    } catch (error) {
      console.error("Get user error:", error)
      return res.status(404).json({ message: "User not found" })
    }
  }

  static async signup(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = new User({ username, email, password, authMethod: "local" });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async signin(req, res) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      });

      if (!user || user.authMethod !== "local") {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      //  Generate JWT Token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

      res.json({ message: "Signin successful", token, user });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
export default authController;
