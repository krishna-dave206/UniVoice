import { Router, Request, Response } from "express";
import { adminService } from "../services/AdminService";
import { PostStatus } from "../models/Post";
// import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = Router();

// All admin routes should be protected:
// router.use(verifyToken, requireRole("admin"));
router.get("/stats", (_req: Request, res: Response) => {
  try {
    const stats = adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/posts", (req: Request, res: Response) => {
  try {
    const status = req.query.status as PostStatus | undefined;
    const category = req.query.category as string | undefined;
    const posts = adminService.listAllPosts({ status, category });
    res.json({ success: true, data: posts.map((p) => p.toJSON()) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/:id/assign", (req: Request, res: Response) => {
  try {
    const { staffId } = req.body;
    const adminId = (req as any).user?.userId ?? req.body.adminId;

    if (!staffId) {
      return res.status(400).json({ success: false, message: "staffId is required" });
    }

    const updated = adminService.assignPost(req.params.id, staffId, adminId);
    res.json({ success: true, data: updated.toJSON() });
  } catch (err: any) {
    const status = err.message.includes("Only admins") ? 403 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

router.patch("/:id/status", (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const adminId = (req as any).user?.userId ?? req.body.adminId;

    if (!Object.values(PostStatus).includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updated = adminService.changePostStatus(req.params.id, status, adminId);
    res.json({ success: true, data: updated.toJSON() });
  } catch (err: any) {
    const code = err.message.includes("Only admins") ? 403 : 500;
    res.status(code).json({ success: false, message: err.message });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.userId ?? req.body.adminId;
    adminService.deletePost(req.params.id, adminId);
    res.json({ success: true, message: "Post deleted by admin" });
  } catch (err: any) {
    const code = err.message.includes("Only admins") ? 403 : 500;
    res.status(code).json({ success: false, message: err.message });
  }
});

export default router;