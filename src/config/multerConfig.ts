// import multer from 'multer';

// // Configure multer for file uploads
// const upload = multer({
//     storage: multer.memoryStorage(), // Store files in memory
//     limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
//     fileFilter: (req, file, cb) => {
//         // Accept only certain file types (images, videos, documents)
//         const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|pdf|doc|docx|txt/;
//         const mimeType = allowedTypes.test(file.mimetype);
//         const extName = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
//         if (mimeType && extName) {
//             return cb(null, true);
//         }
//         cb(new Error('Invalid file type'));
//     }
// });
