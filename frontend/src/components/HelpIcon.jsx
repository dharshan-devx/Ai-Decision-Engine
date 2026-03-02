import React, { useState, useRef, useLayoutEffect } from 'react';

export default function HelpIcon({ tooltip, small }) {
    const [show, setShow] = useState(false);
    const tooltipRef = useRef(null);

    useLayoutEffect(() => {
        if (show && tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            if (rect.right > window.innerWidth - 10) {
                tooltipRef.current.style.left = 'auto';
                tooltipRef.current.style.right = '0';
                tooltipRef.current.style.transform = 'none';
            } else if (rect.left < 10) {
                tooltipRef.current.style.left = '0';
                tooltipRef.current.style.right = 'auto';
                tooltipRef.current.style.transform = 'none';
            } else {
                // Reset to default centering
                tooltipRef.current.style.left = '50%';
                tooltipRef.current.style.right = 'auto';
                tooltipRef.current.style.transform = 'translateX(-50%)';
            }
        }
    }, [show]);

    return (
        <div
            className={`help-icon-wrapper ${small ? 'small' : ''}`}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onFocus={() => setShow(true)}
            onBlur={() => setShow(false)}
            tabIndex={0}
            aria-label="Help information"
        >
            <span className="help-icon-trigger">?</span>

            {show && (
                <div ref={tooltipRef} className="help-icon-tooltip">
                    {tooltip}
                </div>
            )}
        </div>
    );
}
