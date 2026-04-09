const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({destination: function(req, file, cb){

    cb(null, uploadDirectory)


},


filename: function (req, file, cb){

    const ext = path.extname(file.originalname)

    cb(null, `${file.fieldname}_${Date.now()}${ext}`)



}

})



const upload = multer({storage: storage})

module.exports = upload
