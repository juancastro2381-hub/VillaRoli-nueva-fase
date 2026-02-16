import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
                <div className="p-6">
                    {children}
                </div>
                {footer && (
                    <div className="border-t bg-gray-50 p-4 rounded-b-lg flex justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
