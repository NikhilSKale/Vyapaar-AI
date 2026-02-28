import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyle = "flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg py-3 px-6",
        secondary: "bg-blue-900 hover:bg-blue-950 text-white shadow-md hover:shadow-lg py-3 px-6",
        outline: "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 py-3 px-6 bg-white"
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${widthStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
