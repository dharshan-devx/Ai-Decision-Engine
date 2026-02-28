import { useState, useEffect } from "react";

export default function Toast({ message, onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast ${visible ? "toast-in" : "toast-out"}`}>
            <span className="toast-icon">✓</span>
            {message}
        </div>
    );
}
