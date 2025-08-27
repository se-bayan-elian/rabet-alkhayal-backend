const bcrypt = require("bcryptjs"); async function hashPassword() { const salt = await bcrypt.genSalt(); const hash = await bcrypt.hash("555687123", salt); console.log(hash); } hashPassword();
