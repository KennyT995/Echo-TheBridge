import { useState } from "react";
import { useFirestore } from "@/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { FirestorePaths } from "@/lib/firestore-paths";
import { logger } from "@/lib/logger";

interface UseDeleteVisionResult {
    deleteVision: (userId: string, visionId: string) => Promise<{ success: boolean; error?: string }>;
    isDeleting: boolean;
}

export function useDeleteVision(): UseDeleteVisionResult {
    const firestore = useFirestore();
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteVision = async (userId: string, visionId: string) => {
        if (!userId || !visionId) {
            return { success: false, error: "Missing user ID or vision ID" };
        }

        setIsDeleting(true);
        try {
            const batch = writeBatch(firestore);

            const visionRef = doc(firestore, FirestorePaths.vision(userId, visionId));
            const roadmapRef = doc(firestore, FirestorePaths.roadmap(userId, visionId));

            batch.delete(visionRef);
            batch.delete(roadmapRef);

            await batch.commit();
            return { success: true };
        } catch (error) {
            logger.error("Failed to delete vision", error);
            return { success: false, error: "Failed to delete vision. Please try again." };
        } finally {
            setIsDeleting(false);
        }
    };

    return { deleteVision, isDeleting };
}
