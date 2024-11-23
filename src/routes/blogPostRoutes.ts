import { Router } from "express";
import { getRepository } from "typeorm";
import { BlogPost } from "../Entities/BlogPost";
import multer from "multer";
import path from "path";

const router = Router();

// Multer configurations for image and DOCX file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, 'uploads/docx/');
        } else {
            cb(null, 'uploads/images/blog');
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/blog-posts', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'docx', maxCount: 1 }]), async (req: any, res: any) => {
    console.log("Trying blog post")
    const { title, author } = req.body;
    const imageFile = req.files['image'][0];
    const docxFile = req.files['docx'][0];
    
    const headerImageUrl = `uploads/images/${imageFile.filename}`;
    const docxFileUrl = `uploads/docx/${docxFile.filename}`;

    try {
        const blogPostRepository = getRepository(BlogPost);
        const blogPost = blogPostRepository.create({
            title,
            author,
            headerImageUrl,
            docxFileUrl
        });
        await blogPostRepository.save(blogPost);
        res.status(201).json(blogPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

router.get('/blog-posts', async (req: any, res: any) => {
    const blogPostRepository = getRepository(BlogPost);
    const blogPosts = await blogPostRepository.find();
    res.json(blogPosts);
});

router.get('/blog-posts/:id', async (req: any, res: any) => {
    const blogPostRepository = getRepository(BlogPost);
    const blogPost = await blogPostRepository.findOne(req.params.id);
    if (!blogPost) {
        return res.status(404).json({ message: "BlogPost not found" });
    }
    res.json(blogPost);
});

router.delete('/blog-posts/:id', async (req, res) => {
    const blogPostRepository = getRepository(BlogPost);
    const result = await blogPostRepository.delete(req.params.id);
    if (result.affected === 0) {
        return res.status(404).json({ message: "BlogPost not found" });
    }
    res.json({ message: "BlogPost deleted successfully" });
});

export { router as blogPostRouter };
