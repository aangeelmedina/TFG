import { useCallback, useState } from "react";
import type { ToastState } from "../types";

export function useToast() {
    const [toast, setToast] = useState<ToastState>(null);
    const show = useCallback((msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);
    return { toast, show };
}